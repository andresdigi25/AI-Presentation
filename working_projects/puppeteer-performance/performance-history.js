const fs = require('fs');
const path = require('path');

class PerformanceHistory {
    constructor() {
        this.historyFile = path.join(__dirname, 'performance-results', 'performance-history.json');
        this.history = this.loadHistory();
    }

    loadHistory() {
        try {
            if (fs.existsSync(this.historyFile)) {
                return JSON.parse(fs.readFileSync(this.historyFile, 'utf8'));
            }
        } catch (error) {
            console.error('Error loading history:', error);
        }
        return {
            runs: [],
            trends: {
                // Timing metrics
                navigationTime: [],
                addToCartTime: [],
                checkoutTime: [],
                successTime: [],
                totalTime: [],
                // Success metrics
                successRate: [],
                failureRate: [],
                // Performance metrics
                averageResponseTime: [],
                maxResponseTime: [],
                minResponseTime: [],
                // Resource metrics
                memoryUsage: [],
                cpuUsage: [],
                // Load metrics
                usersPerSecond: [],
                throughput: [],
                // Error metrics
                errorRate: [],
                retryCount: [],
                // Browser metrics
                browserMemoryUsage: [],
                browserCpuUsage: [],
                // Network metrics
                networkLatency: [],
                dnsLookupTime: [],
                tcpConnectionTime: [],
                // Custom metrics
                customMetrics: {}
            }
        };
    }

    saveHistory() {
        try {
            fs.writeFileSync(this.historyFile, JSON.stringify(this.history, null, 2));
        } catch (error) {
            console.error('Error saving history:', error);
        }
    }

    addRun(report) {
        const run = {
            timestamp: report.timestamp,
            numUsers: report.numUsers,
            successRate: report.successRate,
            totalTime: report.totalTime,
            statistics: report.statistics,
            failures: report.results.filter(r => !r.success).map(r => ({
                user: r.user,
                error: r.error
            })),
            // Add new metrics
            metrics: {
                failureRate: 100 - report.successRate,
                errorRate: (report.results.filter(r => r.error).length / report.numUsers) * 100,
                usersPerSecond: report.numUsers / (report.totalTime / 1000),
                throughput: (report.results.filter(r => r.success).length / (report.totalTime / 1000)),
                retryCount: report.results.reduce((sum, r) => sum + (r.retryCount || 0), 0),
                averageResponseTime: report.results.reduce((sum, r) => sum + r.totalTime, 0) / report.results.length,
                maxResponseTime: Math.max(...report.results.map(r => r.totalTime)),
                minResponseTime: Math.min(...report.results.map(r => r.totalTime)),
                // Resource metrics from process
                memoryUsage: process.memoryUsage(),
                cpuUsage: process.cpuUsage(),
                // Browser metrics (if available)
                browserMetrics: report.browserMetrics || {},
                // Network metrics (if available)
                networkMetrics: report.networkMetrics || {}
            }
        };

        this.history.runs.push(run);

        // Update all trends
        this.updateTrends(run);
        this.saveHistory();
        this.generateSummary();
    }

    updateTrends(run) {
        // Update existing trends
        if (run.statistics) {
            this.updateTimingTrends(run);
        }
        this.updateSuccessTrends(run);
        this.updatePerformanceTrends(run);
        this.updateResourceTrends(run);
        this.updateLoadTrends(run);
        this.updateErrorTrends(run);
        this.updateBrowserTrends(run);
        this.updateNetworkTrends(run);
    }

    updateTimingTrends(run) {
        const timingMetrics = {
            navigationTime: run.statistics.averageNavigationTime,
            addToCartTime: run.statistics.averageCartTime,
            checkoutTime: run.statistics.averageCheckoutTime,
            successTime: run.statistics.averageSuccessTime,
            totalTime: run.statistics.averageTotalTime
        };

        Object.entries(timingMetrics).forEach(([metric, value]) => {
            this.history.trends[metric].push({
                timestamp: run.timestamp,
                value,
                numUsers: run.numUsers
            });
        });
    }

    updateSuccessTrends(run) {
        this.history.trends.successRate.push({
            timestamp: run.timestamp,
            value: run.successRate,
            numUsers: run.numUsers
        });
        this.history.trends.failureRate.push({
            timestamp: run.timestamp,
            value: run.metrics.failureRate,
            numUsers: run.numUsers
        });
    }

    updatePerformanceTrends(run) {
        const performanceMetrics = {
            averageResponseTime: run.metrics.averageResponseTime,
            maxResponseTime: run.metrics.maxResponseTime,
            minResponseTime: run.metrics.minResponseTime
        };

        Object.entries(performanceMetrics).forEach(([metric, value]) => {
            this.history.trends[metric].push({
                timestamp: run.timestamp,
                value,
                numUsers: run.numUsers
            });
        });
    }

    updateResourceTrends(run) {
        this.history.trends.memoryUsage.push({
            timestamp: run.timestamp,
            value: run.metrics.memoryUsage.heapUsed,
            numUsers: run.numUsers
        });
        this.history.trends.cpuUsage.push({
            timestamp: run.timestamp,
            value: run.metrics.cpuUsage.user + run.metrics.cpuUsage.system,
            numUsers: run.numUsers
        });
    }

    updateLoadTrends(run) {
        this.history.trends.usersPerSecond.push({
            timestamp: run.timestamp,
            value: run.metrics.usersPerSecond,
            numUsers: run.numUsers
        });
        this.history.trends.throughput.push({
            timestamp: run.timestamp,
            value: run.metrics.throughput,
            numUsers: run.numUsers
        });
    }

    updateErrorTrends(run) {
        this.history.trends.errorRate.push({
            timestamp: run.timestamp,
            value: run.metrics.errorRate,
            numUsers: run.numUsers
        });
        this.history.trends.retryCount.push({
            timestamp: run.timestamp,
            value: run.metrics.retryCount,
            numUsers: run.numUsers
        });
    }

    updateBrowserTrends(run) {
        if (run.metrics.browserMetrics) {
            this.history.trends.browserMemoryUsage.push({
                timestamp: run.timestamp,
                value: run.metrics.browserMetrics.memoryUsage || 0,
                numUsers: run.numUsers
            });
            this.history.trends.browserCpuUsage.push({
                timestamp: run.timestamp,
                value: run.metrics.browserMetrics.cpuUsage || 0,
                numUsers: run.numUsers
            });
        }
    }

    updateNetworkTrends(run) {
        if (run.metrics.networkMetrics) {
            this.history.trends.networkLatency.push({
                timestamp: run.timestamp,
                value: run.metrics.networkMetrics.latency || 0,
                numUsers: run.numUsers
            });
            this.history.trends.dnsLookupTime.push({
                timestamp: run.timestamp,
                value: run.metrics.networkMetrics.dnsLookup || 0,
                numUsers: run.numUsers
            });
            this.history.trends.tcpConnectionTime.push({
                timestamp: run.timestamp,
                value: run.metrics.networkMetrics.tcpConnection || 0,
                numUsers: run.numUsers
            });
        }
    }

    generateSummary() {
        const summary = {
            lastUpdated: new Date().toISOString(),
            totalRuns: this.history.runs.length,
            byUserCount: this.groupByUserCount(),
            trends: this.analyzeTrends(),
            commonErrors: this.analyzeErrors(),
            performanceMetrics: this.analyzePerformanceMetrics(),
            resourceMetrics: this.analyzeResourceMetrics(),
            loadMetrics: this.analyzeLoadMetrics()
        };

        const summaryFile = path.join(__dirname, 'performance-results', 'performance-summary.html');
        const html = this.generateHtmlSummary(summary);
        fs.writeFileSync(summaryFile, html);
    }

    analyzePerformanceMetrics() {
        const latestRun = this.history.runs[this.history.runs.length - 1];
        if (!latestRun) return null;

        return {
            averageResponseTime: latestRun.metrics.averageResponseTime,
            maxResponseTime: latestRun.metrics.maxResponseTime,
            minResponseTime: latestRun.metrics.minResponseTime,
            responseTimeRange: latestRun.metrics.maxResponseTime - latestRun.metrics.minResponseTime
        };
    }

    analyzeResourceMetrics() {
        const latestRun = this.history.runs[this.history.runs.length - 1];
        if (!latestRun) return null;

        return {
            memoryUsage: latestRun.metrics.memoryUsage,
            cpuUsage: latestRun.metrics.cpuUsage,
            browserMemoryUsage: latestRun.metrics.browserMetrics?.memoryUsage,
            browserCpuUsage: latestRun.metrics.browserMetrics?.cpuUsage
        };
    }

    analyzeLoadMetrics() {
        const latestRun = this.history.runs[this.history.runs.length - 1];
        if (!latestRun) return null;

        return {
            usersPerSecond: latestRun.metrics.usersPerSecond,
            throughput: latestRun.metrics.throughput,
            errorRate: latestRun.metrics.errorRate,
            retryCount: latestRun.metrics.retryCount
        };
    }

    groupByUserCount() {
        const groups = {};
        this.history.runs.forEach(run => {
            if (!groups[run.numUsers]) {
                groups[run.numUsers] = [];
            }
            groups[run.numUsers].push(run);
        });
        return groups;
    }

    analyzeTrends() {
        const trends = {};
        Object.keys(this.history.trends).forEach(metric => {
            const data = this.history.trends[metric];
            if (data.length > 1) {
                const latest = data[data.length - 1];
                const previous = data[data.length - 2];
                const change = ((latest.value - previous.value) / previous.value) * 100;
                trends[metric] = {
                    latest: latest.value,
                    change: change.toFixed(2) + '%',
                    direction: change > 0 ? 'increase' : 'decrease'
                };
            }
        });
        return trends;
    }

    analyzeErrors() {
        const errorCounts = {};
        this.history.runs.forEach(run => {
            run.failures.forEach(failure => {
                const error = failure.error || 'Unknown error';
                errorCounts[error] = (errorCounts[error] || 0) + 1;
            });
        });
        return Object.entries(errorCounts)
            .sort(([,a], [,b]) => b - a)
            .map(([error, count]) => ({ error, count }));
    }

    generateComparison() {
        const userGroups = this.groupByUserCount();
        const metricKeys = [
            'totalTime', 'navigationTime', 'addToCartTime', 'checkoutTime', 'successTime', 'successRate', 'errorRate', 'throughput', 'usersPerSecond',
            'memoryUsage', 'cpuUsage', 'browserMemoryUsage', 'browserCpuUsage', 'networkLatency', 'dnsLookupTime', 'tcpConnectionTime', 'retryCount'
        ];
        const comparison = {
            userCounts: Object.keys(userGroups).map(Number).sort((a, b) => a - b),
            metrics: {},
            differences: {},
            statistics: {}
        };
        // Initialize metrics and differences arrays for all keys
        metricKeys.forEach(key => {
            comparison.metrics[key] = [];
            comparison.differences[key] = [];
        });
        // Calculate metrics for each user count
        comparison.userCounts.forEach(userCount => {
            const runs = userGroups[userCount];
            const latestRun = runs[runs.length - 1];
            comparison.metrics.totalTime.push(latestRun.totalTime);
            comparison.metrics.navigationTime.push(latestRun.statistics.averageNavigationTime);
            comparison.metrics.addToCartTime.push(latestRun.statistics.averageCartTime);
            comparison.metrics.checkoutTime.push(latestRun.statistics.averageCheckoutTime);
            comparison.metrics.successTime.push(latestRun.statistics.averageSuccessTime);
            comparison.metrics.successRate.push(latestRun.successRate);
            comparison.metrics.errorRate.push(latestRun.metrics.errorRate);
            comparison.metrics.throughput.push(latestRun.metrics.throughput);
            comparison.metrics.usersPerSecond.push(latestRun.metrics.usersPerSecond);
            comparison.metrics.memoryUsage.push(latestRun.metrics?.memoryUsage?.heapUsed || 0);
            comparison.metrics.cpuUsage.push((latestRun.metrics?.cpuUsage?.user || 0) + (latestRun.metrics?.cpuUsage?.system || 0));
            comparison.metrics.browserMemoryUsage.push(latestRun.metrics?.browserMetrics?.memoryUsage || 0);
            comparison.metrics.browserCpuUsage.push(latestRun.metrics?.browserMetrics?.cpuUsage || 0);
            comparison.metrics.networkLatency.push(latestRun.metrics?.networkMetrics?.latency || 0);
            comparison.metrics.dnsLookupTime.push(latestRun.metrics?.networkMetrics?.dnsLookup || 0);
            comparison.metrics.tcpConnectionTime.push(latestRun.metrics?.networkMetrics?.tcpConnection || 0);
            comparison.metrics.retryCount.push(latestRun.metrics?.retryCount || 0);
        });
        // Calculate differences between consecutive user counts
        for (let i = 1; i < comparison.userCounts.length; i++) {
            const prevCount = comparison.userCounts[i - 1];
            const currCount = comparison.userCounts[i];
            metricKeys.forEach(metric => {
                if (comparison.metrics[metric][i] !== undefined && comparison.metrics[metric][i - 1] !== undefined) {
                    comparison.differences[metric].push({
                        from: prevCount,
                        to: currCount,
                        absolute: comparison.metrics[metric][i] - comparison.metrics[metric][i - 1],
                        percentage: ((comparison.metrics[metric][i] - comparison.metrics[metric][i - 1]) / (comparison.metrics[metric][i - 1] || 1)) * 100
                    });
                }
            });
        }
        // Calculate statistical analysis for each metric
        metricKeys.forEach(metric => {
            const values = comparison.metrics[metric].filter(v => v !== undefined);
            if (values.length > 0) {
                const mean = values.reduce((a, b) => a + b, 0) / values.length;
                const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
                const stdDev = Math.sqrt(variance);
                comparison.statistics[metric] = {
                    mean,
                    stdDev,
                    min: Math.min(...values),
                    max: Math.max(...values),
                    range: Math.max(...values) - Math.min(...values),
                    confidenceInterval: {
                        lower: mean - (1.96 * stdDev / Math.sqrt(values.length)),
                        upper: mean + (1.96 * stdDev / Math.sqrt(values.length))
                    }
                };
            }
        });
        return comparison;
    }

    generateHtmlSummary(summary) {
        const comparison = this.generateComparison();
        
        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Performance Test Summary</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: sans-serif; margin: 20px; }
        .card { border: 1px solid #ddd; border-radius: 4px; padding: 15px; margin: 10px 0; }
        .trend { color: #666; }
        .trend.increase { color: #d32f2f; }
        .trend.decrease { color: #388e3c; }
        table { border-collapse: collapse; width: 100%; margin: 10px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #f5f5f5; }
        .metric { font-weight: bold; }
        .metric-group { margin: 20px 0; }
        .metric-group h3 { color: #333; margin-bottom: 10px; }
        .metric-value { font-size: 1.2em; color: #2196f3; }
        .metric-label { color: #666; font-size: 0.9em; }
        .chart-container { 
            position: relative; 
            height: 300px; 
            margin: 20px 0;
            padding: 10px;
            background: #fff;
            border-radius: 4px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .chart-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .chart-card {
            background: #fff;
            border-radius: 4px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            padding: 15px;
        }
        .comparison-card {
            background: #fff;
            border-radius: 4px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            padding: 20px;
            margin: 20px 0;
        }
        .comparison-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        .comparison-table th, .comparison-table td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        .comparison-table th {
            background: #f5f5f5;
        }
        .metric-change {
            font-weight: bold;
        }
        .metric-change.increase {
            color: #d32f2f;
        }
        .metric-change.decrease {
            color: #388e3c;
        }
        .comparison-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .statistics-card {
            background: #f8f9fa;
            border-radius: 4px;
            padding: 15px;
            margin: 10px 0;
        }
        .statistics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin: 15px 0;
        }
        .statistic-item {
            background: white;
            padding: 10px;
            border-radius: 4px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .statistic-label {
            color: #666;
            font-size: 0.9em;
            margin-bottom: 5px;
        }
        .statistic-value {
            font-size: 1.1em;
            font-weight: bold;
            color: #2196f3;
        }
        .confidence-interval {
            font-size: 0.9em;
            color: #666;
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <h1>Performance Test Summary</h1>
    <p>Last updated: ${summary.lastUpdated}</p>
    <p>Total test runs: ${summary.totalRuns}</p>

    <div class="comparison-card">
        <h2>Load Test Comparison</h2>
        
        <!-- Response Times Comparison -->
        <div class="comparison-grid">
            <div>
                <h3>Response Times by User Count</h3>
                <table class="comparison-table">
                    <tr>
                        <th>User Count</th>
                        <th>Navigation</th>
                        <th>Add to Cart</th>
                        <th>Checkout</th>
                        <th>Success</th>
                        <th>Total</th>
                    </tr>
                    ${comparison.userCounts.map((count, i) => `
                        <tr>
                            <td>${count}</td>
                            <td>${(comparison.metrics.navigationTime[i]/1000).toFixed(2)}s</td>
                            <td>${(comparison.metrics.addToCartTime[i]/1000).toFixed(2)}s</td>
                            <td>${(comparison.metrics.checkoutTime[i]/1000).toFixed(2)}s</td>
                            <td>${(comparison.metrics.successTime[i]/1000).toFixed(2)}s</td>
                            <td>${(comparison.metrics.totalTime[i]/1000).toFixed(2)}s</td>
                        </tr>
                    `).join('')}
                </table>
            </div>
            
            <!-- Performance Metrics Comparison -->
            <div>
                <h3>Performance Metrics by User Count</h3>
                <table class="comparison-table">
                    <tr>
                        <th>User Count</th>
                        <th>Success Rate</th>
                        <th>Error Rate</th>
                        <th>Throughput</th>
                        <th>Users/Second</th>
                    </tr>
                    ${comparison.userCounts.map((count, i) => `
                        <tr>
                            <td>${count}</td>
                            <td>${comparison.metrics.successRate[i].toFixed(2)}%</td>
                            <td>${comparison.metrics.errorRate[i].toFixed(2)}%</td>
                            <td>${comparison.metrics.throughput[i].toFixed(2)} req/s</td>
                            <td>${comparison.metrics.usersPerSecond[i].toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </table>
            </div>
        </div>

        <!-- Resource Usage Comparison -->
        <div class="comparison-grid">
            <div>
                <h3>Resource Usage by User Count</h3>
                <table class="comparison-table">
                    <tr>
                        <th>User Count</th>
                        <th>Memory (MB)</th>
                        <th>CPU Usage</th>
                        <th>Browser Memory</th>
                        <th>Browser CPU</th>
                    </tr>
                    ${comparison.userCounts.map((count, i) => `
                        <tr>
                            <td>${count}</td>
                            <td>${(comparison.metrics.memoryUsage[i]/1024/1024).toFixed(2)}</td>
                            <td>${comparison.metrics.cpuUsage[i].toFixed(2)}%</td>
                            <td>${(comparison.metrics.browserMemoryUsage[i]/1024/1024).toFixed(2)}</td>
                            <td>${comparison.metrics.browserCpuUsage[i].toFixed(2)}%</td>
                        </tr>
                    `).join('')}
                </table>
            </div>
            
            <!-- Network Metrics Comparison -->
            <div>
                <h3>Network Metrics by User Count</h3>
                <table class="comparison-table">
                    <tr>
                        <th>User Count</th>
                        <th>Latency</th>
                        <th>DNS Lookup</th>
                        <th>TCP Connect</th>
                        <th>Retry Count</th>
                    </tr>
                    ${comparison.userCounts.map((count, i) => `
                        <tr>
                            <td>${count}</td>
                            <td>${comparison.metrics.networkLatency[i].toFixed(2)}ms</td>
                            <td>${comparison.metrics.dnsLookupTime[i].toFixed(2)}ms</td>
                            <td>${comparison.metrics.tcpConnectionTime[i].toFixed(2)}ms</td>
                            <td>${comparison.metrics.retryCount[i]}</td>
                        </tr>
                    `).join('')}
                </table>
            </div>
        </div>

        <!-- Statistical Analysis -->
        <h3>Statistical Analysis</h3>
        <div class="statistics-grid">
            ${Object.entries(comparison.statistics).map(([metric, stats]) => `
                <div class="statistics-card">
                    <h4>${metric.replace(/([A-Z])/g, ' $1').trim()}</h4>
                    <div class="statistic-item">
                        <div class="statistic-label">Mean</div>
                        <div class="statistic-value">${(stats.mean/1000).toFixed(2)}s</div>
                    </div>
                    <div class="statistic-item">
                        <div class="statistic-label">Standard Deviation</div>
                        <div class="statistic-value">${(stats.stdDev/1000).toFixed(2)}s</div>
                    </div>
                    <div class="statistic-item">
                        <div class="statistic-label">Range</div>
                        <div class="statistic-value">${(stats.range/1000).toFixed(2)}s</div>
                    </div>
                    <div class="statistic-item">
                        <div class="statistic-label">95% Confidence Interval</div>
                        <div class="confidence-interval">
                            ${(stats.confidenceInterval.lower/1000).toFixed(2)}s - ${(stats.confidenceInterval.upper/1000).toFixed(2)}s
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>

        <!-- Performance Changes -->
        <h3>Performance Changes Between Load Levels</h3>
        <div class="comparison-grid">
            ${Object.entries(comparison.differences).map(([metric, diffs]) => `
                <div>
                    <h4>${metric.replace(/([A-Z])/g, ' $1').trim()}</h4>
                    <table class="comparison-table">
                        <tr>
                            <th>From → To</th>
                            <th>Absolute Change</th>
                            <th>Percentage Change</th>
                        </tr>
                        ${diffs.map(diff => `
                            <tr>
                                <td>${diff.from} → ${diff.to}</td>
                                <td class="metric-change ${diff.absolute > 0 ? 'increase' : 'decrease'}">
                                    ${(diff.absolute/1000).toFixed(2)}s
                                </td>
                                <td class="metric-change ${diff.percentage > 0 ? 'increase' : 'decrease'}">
                                    ${diff.percentage.toFixed(2)}%
                                </td>
                            </tr>
                        `).join('')}
                    </table>
                </div>
            `).join('')}
        </div>
    </div>

    <div class="chart-grid">
        <div class="chart-card">
            <h3>Response Times Over Time</h3>
            <div class="chart-container">
                <canvas id="responseTimeChart"></canvas>
            </div>
        </div>
        <div class="chart-card">
            <h3>Success Rate Trends</h3>
            <div class="chart-container">
                <canvas id="successRateChart"></canvas>
            </div>
        </div>
        <div class="chart-card">
            <h3>Resource Usage</h3>
            <div class="chart-container">
                <canvas id="resourceUsageChart"></canvas>
            </div>
        </div>
        <div class="chart-card">
            <h3>Throughput Analysis</h3>
            <div class="chart-container">
                <canvas id="throughputChart"></canvas>
            </div>
        </div>
    </div>

    <div class="card">
        <h2>Recent Trends</h2>
        <table>
            <tr>
                <th>Metric</th>
                <th>Latest Value</th>
                <th>Change</th>
            </tr>
            ${Object.entries(summary.trends).map(([metric, data]) => `
                <tr>
                    <td class="metric">${metric}</td>
                    <td>${data.latest.toFixed(2)}ms</td>
                    <td class="trend ${data.direction}">${data.change}</td>
                </tr>
            `).join('')}
        </table>
    </div>

    ${summary.performanceMetrics ? `
    <div class="card">
        <h2>Performance Metrics</h2>
        <div class="metric-group">
            <div class="metric-label">Response Time</div>
            <div class="metric-value">
                Avg: ${(summary.performanceMetrics.averageResponseTime/1000).toFixed(2)}s
                (Min: ${(summary.performanceMetrics.minResponseTime/1000).toFixed(2)}s,
                Max: ${(summary.performanceMetrics.maxResponseTime/1000).toFixed(2)}s)
            </div>
        </div>
    </div>
    ` : ''}

    ${summary.resourceMetrics ? `
    <div class="card">
        <h2>Resource Usage</h2>
        <div class="metric-group">
            <div class="metric-label">Memory Usage</div>
            <div class="metric-value">
                Heap: ${(summary.resourceMetrics.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB
                (Total: ${(summary.resourceMetrics.memoryUsage.heapTotal / 1024 / 1024).toFixed(2)}MB)
            </div>
            ${summary.resourceMetrics.browserMemoryUsage ? `
            <div class="metric-label">Browser Memory</div>
            <div class="metric-value">${(summary.resourceMetrics.browserMemoryUsage / 1024 / 1024).toFixed(2)}MB</div>
            ` : ''}
        </div>
    </div>
    ` : ''}

    ${summary.loadMetrics ? `
    <div class="card">
        <h2>Load Metrics</h2>
        <div class="metric-group">
            <div class="metric-label">Throughput</div>
            <div class="metric-value">${summary.loadMetrics.throughput.toFixed(2)} requests/second</div>
            <div class="metric-label">Users/Second</div>
            <div class="metric-value">${summary.loadMetrics.usersPerSecond.toFixed(2)}</div>
            <div class="metric-label">Error Rate</div>
            <div class="metric-value">${summary.loadMetrics.errorRate.toFixed(2)}%</div>
            <div class="metric-label">Retry Count</div>
            <div class="metric-value">${summary.loadMetrics.retryCount}</div>
        </div>
    </div>
    ` : ''}

    <div class="card">
        <h2>Common Errors</h2>
        <table>
            <tr>
                <th>Error</th>
                <th>Count</th>
            </tr>
            ${summary.commonErrors.map(({error, count}) => `
                <tr>
                    <td>${error}</td>
                    <td>${count}</td>
                </tr>
            `).join('')}
        </table>
    </div>

    <div class="card">
        <h2>Results by User Count</h2>
        ${Object.entries(summary.byUserCount).map(([userCount, runs]) => `
            <h3>${userCount} Users</h3>
            <table>
                <tr>
                    <th>Timestamp</th>
                    <th>Success Rate</th>
                    <th>Total Time</th>
                    <th>Throughput</th>
                    <th>Error Rate</th>
                </tr>
                ${runs.map(run => `
                    <tr>
                        <td>${new Date(run.timestamp).toLocaleString()}</td>
                        <td>${run.successRate.toFixed(2)}%</td>
                        <td>${(run.totalTime/1000).toFixed(2)}s</td>
                        <td>${(run.metrics.throughput).toFixed(2)} req/s</td>
                        <td>${run.metrics.errorRate.toFixed(2)}%</td>
                    </tr>
                `).join('')}
            </table>
        `).join('')}
    </div>

    <script>
        // Prepare data for charts
        const runs = ${JSON.stringify(this.history.runs)};
        const timestamps = runs.map(run => new Date(run.timestamp).toLocaleString());
        
        // Response Time Chart
        new Chart(document.getElementById('responseTimeChart'), {
            type: 'line',
            data: {
                labels: timestamps,
                datasets: [{
                    label: 'Navigation Time',
                    data: runs.map(run => run.statistics?.averageNavigationTime / 1000),
                    borderColor: '#2196f3',
                    tension: 0.1
                }, {
                    label: 'Add to Cart Time',
                    data: runs.map(run => run.statistics?.averageCartTime / 1000),
                    borderColor: '#4caf50',
                    tension: 0.1
                }, {
                    label: 'Checkout Time',
                    data: runs.map(run => run.statistics?.averageCheckoutTime / 1000),
                    borderColor: '#ff9800',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Time (seconds)'
                        }
                    }
                }
            }
        });

        // Success Rate Chart
        new Chart(document.getElementById('successRateChart'), {
            type: 'line',
            data: {
                labels: timestamps,
                datasets: [{
                    label: 'Success Rate',
                    data: runs.map(run => run.successRate),
                    borderColor: '#4caf50',
                    tension: 0.1
                }, {
                    label: 'Error Rate',
                    data: runs.map(run => run.metrics.errorRate),
                    borderColor: '#f44336',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Rate (%)'
                        }
                    }
                }
            }
        });

        // Resource Usage Chart
        new Chart(document.getElementById('resourceUsageChart'), {
            type: 'line',
            data: {
                labels: timestamps,
                datasets: [{
                    label: 'Heap Memory (MB)',
                    data: runs.map(run => run.metrics.memoryUsage.heapUsed / 1024 / 1024),
                    borderColor: '#9c27b0',
                    tension: 0.1
                }, {
                    label: 'Browser Memory (MB)',
                    data: runs.map(run => run.metrics.browserMetrics?.memoryUsage / 1024 / 1024 || 0),
                    borderColor: '#e91e63',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Memory (MB)'
                        }
                    }
                }
            }
        });

        // Throughput Chart
        new Chart(document.getElementById('throughputChart'), {
            type: 'line',
            data: {
                labels: timestamps,
                datasets: [{
                    label: 'Users/Second',
                    data: runs.map(run => run.metrics.usersPerSecond),
                    borderColor: '#00bcd4',
                    tension: 0.1
                }, {
                    label: 'Requests/Second',
                    data: runs.map(run => run.metrics.throughput),
                    borderColor: '#ff5722',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Rate (per second)'
                        }
                    }
                }
            }
        });
    </script>
</body>
</html>`;
    }
}

module.exports = PerformanceHistory; 