import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 flex items-center justify-center p-4">
          <div className="bg-white bg-opacity-90 p-8 rounded-lg shadow-2xl w-full max-w-md text-center">
            <h2 className="text-2xl font-bold mb-4 text-red-600">Oops! Something went wrong.</h2>
            <p className="text-gray-700 mb-4">An error occurred in the application. Please try refreshing the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
            >
              Refresh Page
            </button>
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-gray-600">Error Details</summary>
              <pre className="text-xs text-red-500 mt-2">{this.state.error?.toString()}</pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;