"""RunPod Flash remote training function."""

from runpod_flash import remote, LiveServerless, GpuGroup
import asyncio


# Configure GPU resources for RunPod Flash
gpu_config = LiveServerless(
    name="aiplayground-training",
    gpus=[GpuGroup.AMPERE_48],  # or GpuGroup.A4000 for lower cost
    workersMax=3,
    workersMin=0,  # Auto-scale from 0 (no idle workers)
    idleTimeout=10  # Scale down after 10 seconds of inactivity
)


@remote(
    resource_config=gpu_config,
    dependencies=[
        "torch>=2.0.0",
        "torchvision>=0.15.0",
        "pydantic==2.10.4"
    ]
)
async def train_model_flash(graph_dict: dict, dataset_id: str, config_dict: dict):
    """
    Remote training function that runs on RunPod Flash GPU.

    This function is automatically containerized and deployed by RunPod Flash.
    It yields progress messages and returns the trained model.

    Args:
        graph_dict: GraphSchema as dict
        dataset_id: "mnist", "fashion_mnist", or "cifar10"
        config_dict: TrainingConfig as dict

    Yields:
        Progress messages: {"type": "batch"|"epoch"|"started"|"completed"|"error", ...}

    Returns:
        Final result with model state_dict
    """
    import torch
    import torch.nn as nn
    import time
    import base64
    import io

    # Import from backend modules (Flash copies these automatically)
    from compiler.model_builder import build_model
    from compiler.validator import validate_graph, ValidationError
    from training.datasets import get_dataloaders, get_dataset_shape
    from models.schemas import GraphSchema, TrainingConfig

    try:
        # Parse and validate inputs
        graph = GraphSchema(**graph_dict)
        config = TrainingConfig(**config_dict)

        # Build model
        input_shape = get_dataset_shape(dataset_id)
        model = build_model(graph, input_shape)

        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        model = model.to(device)

        # Load data
        train_loader, val_loader = get_dataloaders(
            dataset_id, config.batch_size, config.train_split
        )

        # Setup loss function
        output_nodes = [n for n in graph.nodes if n.type == "output"]
        loss_fn_name = output_nodes[0].params.get("loss_fn", "CrossEntropyLoss") if output_nodes else "CrossEntropyLoss"
        loss_fn_map = {
            "CrossEntropyLoss": nn.CrossEntropyLoss(),
            "MSELoss": nn.MSELoss(),
            "BCEWithLogitsLoss": nn.BCEWithLogitsLoss(),
        }
        loss_fn = loss_fn_map.get(loss_fn_name, nn.CrossEntropyLoss())

        # Setup optimizer
        opt_map = {
            "adam": lambda params, lr: torch.optim.Adam(params, lr=lr),
            "sgd": lambda params, lr: torch.optim.SGD(params, lr=lr),
            "adamw": lambda params, lr: torch.optim.AdamW(params, lr=lr),
        }
        opt_factory = opt_map.get(config.optimizer, opt_map["adam"])
        optimizer = opt_factory(model.parameters(), config.learning_rate)

        # Yield "started" message
        yield {
            "type": "started",
            "total_epochs": config.epochs,
            "total_batches": len(train_loader),
            "device": str(device)
        }

        start_time = time.time()

        # Training loop
        for epoch in range(1, config.epochs + 1):
            # Train phase
            model.train()
            epoch_loss = 0.0
            correct = 0
            total = 0

            for batch_idx, (data, target) in enumerate(train_loader):
                data, target = data.to(device), target.to(device)
                optimizer.zero_grad()
                output = model(data)
                loss = loss_fn(output, target)
                loss.backward()
                optimizer.step()

                epoch_loss += loss.item()
                _, predicted = output.max(1)
                total += target.size(0)
                correct += predicted.eq(target).sum().item()

                # Yield batch update every 50 batches
                if batch_idx % 50 == 0:
                    yield {
                        "type": "batch",
                        "epoch": epoch,
                        "batch": batch_idx,
                        "loss": round(loss.item(), 6)
                    }

            train_loss = epoch_loss / len(train_loader)
            train_acc = correct / total if total > 0 else 0

            # Validation phase
            model.eval()
            val_loss = 0.0
            val_correct = 0
            val_total = 0

            with torch.no_grad():
                for data, target in val_loader:
                    data, target = data.to(device), target.to(device)
                    output = model(data)
                    loss = loss_fn(output, target)
                    val_loss += loss.item()
                    _, predicted = output.max(1)
                    val_total += target.size(0)
                    val_correct += predicted.eq(target).sum().item()

            val_loss /= len(val_loader)
            val_acc = val_correct / val_total if val_total > 0 else 0
            elapsed = time.time() - start_time

            # Yield epoch metrics
            yield {
                "type": "epoch",
                "epoch": epoch,
                "train_loss": round(train_loss, 6),
                "val_loss": round(val_loss, 6),
                "train_acc": round(train_acc, 4),
                "val_acc": round(val_acc, 4),
                "elapsed_sec": round(elapsed, 1)
            }

        # Serialize model as base64
        model_bytes = io.BytesIO()
        torch.save(model.state_dict(), model_bytes)
        model_b64 = base64.b64encode(model_bytes.getvalue()).decode()

        # Yield completion message
        yield {
            "type": "completed",
            "final_metrics": {
                "train_loss": round(train_loss, 6),
                "val_loss": round(val_loss, 6),
                "train_acc": round(train_acc, 4),
                "val_acc": round(val_acc, 4)
            },
            "model_state_dict_b64": model_b64,
            "model_size_bytes": len(model_bytes.getvalue())
        }

    except Exception as e:
        import traceback
        yield {
            "type": "error",
            "message": str(e),
            "traceback": traceback.format_exc()
        }
