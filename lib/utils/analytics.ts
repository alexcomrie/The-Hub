import { onCLS, onLCP, onTTFB, onFCP, onINP } from 'web-vitals';

type MetricName = 'CLS' | 'INP' | 'LCP' | 'TTFB' | 'FCP';

interface MetricData {
  name: MetricName;
  value: number;
  id: string;
  delta: number;
}

const THRESHOLDS = {
  CLS: 0.1,    // Cumulative Layout Shift
  INP: 200,    // Interaction to Next Paint (ms)
  LCP: 2500,   // Largest Contentful Paint (ms)
  TTFB: 600,   // Time to First Byte (ms)
  FCP: 1800    // First Contentful Paint (ms)
};

function isPerformanceIssue(metric: MetricData): boolean {
  return metric.value > (THRESHOLDS[metric.name] || 0);
}

function sendToAnalytics(metric: MetricData) {
  // Check if the metric exceeds threshold
  const hasIssue = isPerformanceIssue(metric);

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`Web Vital: ${metric.name}`, {
      value: Math.round(metric.value),
      delta: Math.round(metric.delta),
      id: metric.id,
      exceeds_threshold: hasIssue
    });
  }

  // Send to your analytics service (e.g., Google Analytics, custom endpoint)
  const analyticsData = {
    metric_name: metric.name,
    value: Math.round(metric.value),
    delta: Math.round(metric.delta),
    id: metric.id,
    exceeds_threshold: hasIssue,
    page_path: window.location.pathname,
    timestamp: new Date().toISOString()
  };

  // You can implement your analytics service call here
  // For example, using Netlify Analytics or a custom endpoint
  if (process.env.NODE_ENV === 'production') {
    try {
      // Example: Send to a custom endpoint
      fetch('/api/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analyticsData),
      });
    } catch (error) {
      console.error('Failed to send metrics:', error);
    }
  }
}

export function initVitals() {
  onCLS(sendToAnalytics);
  onINP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
  onFCP(sendToAnalytics);
}

// Export thresholds for reference
export { THRESHOLDS };