import React, { Component, PropsWithChildren } from "react";
import { Text, View } from "react-native";
import { Button } from "@/components/ui/Button";

interface State {
  hasError: boolean;
}

/**
 * Catches rendering errors anywhere in the tree and shows a friendly
 * recovery screen instead of a blank crash - never exposes raw stack
 * traces to the user (Section 25).
 */
export class ErrorBoundary extends Component<PropsWithChildren, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // In production, forward to a real logging/crash-reporting service here.
    console.warn("Unhandled UI error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 8, textAlign: "center" }}>
            Something went wrong
          </Text>
          <Text style={{ textAlign: "center", marginBottom: 16, color: "#64748B" }}>
            Please restart the app. If you're in an emergency, use your phone's dialer to call for help directly.
          </Text>
          <Button label="Try Again" onPress={() => this.setState({ hasError: false })} />
        </View>
      );
    }
    return this.props.children;
  }
}
