import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, Pressable, SafeAreaView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BlockPalette } from './src/components/BlockPalette';
import { PlaygroundCanvas } from './src/components/PlaygroundCanvas';
import { usePlayground } from './src/hooks/usePlayground';

export default function App() {
  const {
    blocks,
    connections,
    addBlockAtDefault,
    moveBlock,
    portPress,
    pendingConnection,
    selectedBlockId,
    clearPlayground,
  } = usePlayground();

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>AI Playground</Text>
          <Text style={styles.subtitle}>
            Tap a layer to add • Tap output then input to connect
          </Text>
          <Pressable
            onPress={clearPlayground}
            style={({ pressed }) => [styles.clearBtn, pressed && styles.clearBtnPressed]}
          >
            <Text style={styles.clearBtnText}>Clear</Text>
          </Pressable>
        </View>
        <View style={styles.main}>
          <BlockPalette onAddBlock={addBlockAtDefault} />
          <PlaygroundCanvas
            blocks={blocks}
            connections={connections}
            onMoveBlock={moveBlock}
            onPortPress={portPress}
            selectedBlockId={selectedBlockId}
            pendingConnection={pendingConnection}
          />
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0f0f14',
  },
  safe: {
    flex: 1,
    backgroundColor: '#0f0f14',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e28',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f0f0f8',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: '#6b6b80',
    marginTop: 4,
    marginBottom: 10,
  },
  clearBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#2a2a38',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3a3a4a',
  },
  clearBtnPressed: {
    backgroundColor: '#3a3a4a',
  },
  clearBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#a0a0b8',
  },
  main: {
    flex: 1,
    flexDirection: 'row',
  },
});
