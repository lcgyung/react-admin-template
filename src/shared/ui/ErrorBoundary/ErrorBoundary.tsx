import { Component, type ErrorInfo, type ReactNode } from 'react';

import { ErrorFallback } from './ErrorFallback';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * 렌더 트리에서 발생한 에러를 잡아 폴백 UI 를 보여주는 경계.
 *
 * 훅은 렌더 에러를 잡을 수 없어 class 컴포넌트로 구현한다. 에러 보고는 shared 레이어가
 * 상위(app·관찰 도구)에 의존하지 않도록 `onError` prop 으로 주입받는다(app 에서 reportError 연결).
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onError?.(error, info);
  }

  handleReset = (): void => {
    this.setState({ hasError: false });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback ?? <ErrorFallback onReset={this.handleReset} />;
    }
    return this.props.children;
  }
}
