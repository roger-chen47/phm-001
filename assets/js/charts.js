/* PHM Edge系統儀表板 - 圖表配置 */

// 全局ECharts配置
const chartConfig = {
  // 顏色主題
  colors: {
    primary: '#1a56db',
    secondary: '#475569',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    backgroundLight: '#ffffff',
    backgroundDark: '#0f172a',
    textPrimary: '#1e293b',
    textSecondary: '#64748b',
  },

  // 通用主題配置
  theme: {
    backgroundColor: 'transparent',
    textStyle: {
      fontFamily: '"Noto Sans TC", sans-serif',
      color: '#1e293b'
    },
    legend: {
      textStyle: {
        color: '#64748b'
      }
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: '#e2e8f0',
      textStyle: {
        color: '#1e293b'
      },
      shadowBlur: 10,
      shadowColor: 'rgba(0, 0, 0, 0.1)',
      shadowOffsetX: 0,
      shadowOffsetY: 0
    }
  }
};

// 初始化所有圖表的函數
function initCharts() {
  // 在頁面加載完成後初始化圖表
  window.addEventListener('DOMContentLoaded', () => {
    console.log('初始化圖表...');

    // 檢查視圖狀態
    if (app.currentView === 'overview') {
      initOverviewCharts();
    } else if (app.currentView === 'detail' && app.selectedMachine) {
      initDetailCharts();
    }
  });
}

// 總覽視圖圖表初始化
function initOverviewCharts() {
  // 為每個機台創建儀表盤圖表
  app.machines.forEach(machine => {
    createGaugeChart(`gauge-${machine.id}`, machine.healthIndex);
  });

  // 創建全局健康指數圖表
  createGlobalHealthChart();

  // 創建機台狀態分布圖
  createStatusDistribution();
}

// 詳細視圖圖表初始化
function initDetailCharts() {
  if (!app.selectedMachine) return;

  // 創建健康指數詳情圖表
  createHealthDetailChart();

  // 創建剩餘壽命圖表
  createRulDetailChart();

  // 創建參數儀表盤
  createParameterGauges();

  // 創建歷史趨勢圖表
  createHistoryTrendChart();
}

// 更新所有圖表的函數
function updateCharts() {
  // 根據當前視圖更新對應的圖表
  if (app.currentView === 'overview') {
    updateOverviewCharts();
  } else if (app.currentView === 'detail' && app.selectedMachine) {
    updateDetailCharts();
  }
}

// 更新總覽視圖圖表
function updateOverviewCharts() {
  // 更新每個機台的儀表盤圖表
  app.machines.forEach(machine => {
    updateGaugeChart(`gauge-${machine.id}`, machine.healthIndex);
  });

  // 更新全局健康指數圖表
  updateGlobalHealthChart();

  // 更新機台狀態分布圖表
  updateStatusDistribution();
}

// 更新詳細視圖圖表
function updateDetailCharts() {
  if (!app.selectedMachine) return;

  // 更新健康指數詳情圖表
  updateHealthDetailChart();

  // 更新剩餘壽命圖表
  updateRulDetailChart();

  // 更新參數儀表盤
  updateParameterGauges();

  // 更新歷史趨勢圖表
  updateHistoryTrendChart();
}

// 創建健康指數儀表盤圖表
function createGaugeChart(elementId, value) {
  const chartDom = document.getElementById(elementId);
  if (!chartDom) return;

  const myChart = echarts.init(chartDom);

  const option = {
    series: [
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        center: ['50%', '75%'],
        radius: '90%',
        min: 0,
        max: 1,
        splitNumber: 5,
        axisLine: {
          lineStyle: {
            width: 6,
            color: [
              [0.6, chartConfig.colors.danger],
              [0.8, chartConfig.colors.warning],
              [1, chartConfig.colors.success]
            ]
          }
        },
        pointer: {
          icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
          length: '12%',
          width: 6,
          offsetCenter: [0, '-55%'],
          itemStyle: {
            color: 'auto'
          }
        },
        axisTick: {
          length: 12,
          lineStyle: {
            color: 'auto',
            width: 1
          }
        },
        splitLine: {
          length: 20,
          lineStyle: {
            color: 'auto',
            width: 2
          }
        },
        axisLabel: {
          show: false
        },
        title: {
          show: false
        },
        detail: {
          show: false
        },
        data: [
          {
            value: value
          }
        ]
      }
    ]
  };

  myChart.setOption(option);

  // 存儲圖表實例以便後續更新
  if (!window.chartInstances) window.chartInstances = {};
  window.chartInstances[elementId] = myChart;
}

// 更新儀表盤圖表數據
function updateGaugeChart(elementId, value) {
  if (!window.chartInstances || !window.chartInstances[elementId]) {
    createGaugeChart(elementId, value);
    return;
  }

  const chart = window.chartInstances[elementId];

  const option = {
    series: [
      {
        data: [
          {
            value: value
          }
        ]
      }
    ]
  };

  chart.setOption(option);
}

// 創建全局健康指數圖表
function createGlobalHealthChart() {
  const chartDom = document.getElementById('globalHealthChart');
  if (!chartDom) return;

  const myChart = echarts.init(chartDom);

  // 計算平均健康指數
  const avgHealth = app.machines.reduce((sum, machine) => sum + machine.healthIndex, 0) / app.machines.length;

  const option = {
    title: {
      text: `${(avgHealth * 100).toFixed(0)}%`,
      subtext: '平均健康指數',
      left: 'center',
      top: 'center',
      textStyle: {
        fontSize: 28,
        color: getColorByValue(avgHealth)
      },
      subtextStyle: {
        fontSize: 14,
        color: chartConfig.colors.textSecondary
      }
    },
    series: [
      {
        type: 'pie',
        radius: ['65%', '80%'],
        label: {
          show: false
        },
        data: [
          {
            value: avgHealth,
            name: '健康指數',
            itemStyle: {
              color: getColorByValue(avgHealth)
            }
          },
          {
            value: 1 - avgHealth,
            name: '剩餘',
            itemStyle: {
              color: '#e2e8f0'
            }
          }
        ]
      }
    ]
  };

  myChart.setOption(option);

  // 存儲圖表實例
  if (!window.chartInstances) window.chartInstances = {};
  window.chartInstances.globalHealthChart = myChart;
}

// 更新全局健康指數圖表
function updateGlobalHealthChart() {
  if (!window.chartInstances || !window.chartInstances.globalHealthChart) {
    createGlobalHealthChart();
    return;
  }

  const chart = window.chartInstances.globalHealthChart;

  // 計算平均健康指數
  const avgHealth = app.machines.reduce((sum, machine) => sum + machine.healthIndex, 0) / app.machines.length;

  const option = {
    title: {
      text: `${(avgHealth * 100).toFixed(0)}%`,
      textStyle: {
        color: getColorByValue(avgHealth)
      }
    },
    series: [
      {
        data: [
          {
            value: avgHealth,
            itemStyle: {
              color: getColorByValue(avgHealth)
            }
          },
          {
            value: 1 - avgHealth
          }
        ]
      }
    ]
  };

  chart.setOption(option);
}

// 創建機台狀態分布圖表
function createStatusDistribution() {
  const chartDom = document.getElementById('statusPieChart');
  if (!chartDom) return;

  const myChart = echarts.init(chartDom);

  // 統計各種狀態的機台數量
  const statusCount = app.machines.reduce((count, machine) => {
    count[machine.status] = (count[machine.status] || 0) + 1;
    return count;
  }, {});

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      data: [
        { name: '正常', icon: 'circle' },
        { name: '警告', icon: 'circle' },
        { name: '危險', icon: 'circle' }
      ],
      textStyle: {
        color: chartConfig.colors.textSecondary
      }
    },
    series: [
      {
        type: 'pie',
        radius: '70%',
        center: ['40%', '50%'],
        label: {
          show: false
        },
        emphasis: {
          scale: true,
          scaleSize: 10
        },
        data: [
          {
            value: statusCount.normal || 0,
            name: '正常',
            itemStyle: {
              color: chartConfig.colors.success
            }
          },
          {
            value: statusCount.warning || 0,
            name: '警告',
            itemStyle: {
              color: chartConfig.colors.warning
            }
          },
          {
            value: statusCount.danger || 0,
            name: '危險',
            itemStyle: {
              color: chartConfig.colors.danger
            }
          }
        ]
      }
    ]
  };

  myChart.setOption(option);

  // 存儲圖表實例
  if (!window.chartInstances) window.chartInstances = {};
  window.chartInstances.statusPieChart = myChart;
}

// 更新機台狀態分布圖表
function updateStatusDistribution() {
  if (!window.chartInstances || !window.chartInstances.statusPieChart) {
    createStatusDistribution();
    return;
  }

  const chart = window.chartInstances.statusPieChart;

  // 統計各種狀態的機台數量
  const statusCount = app.machines.reduce((count, machine) => {
    count[machine.status] = (count[machine.status] || 0) + 1;
    return count;
  }, {});

  const option = {
    series: [
      {
        data: [
          {
            value: statusCount.normal || 0,
            name: '正常'
          },
          {
            value: statusCount.warning || 0,
            name: '警告'
          },
          {
            value: statusCount.danger || 0,
            name: '危險'
          }
        ]
      }
    ]
  };

  chart.setOption(option);
}

// 創建健康指數詳細圖表（詳細視圖）
function createHealthDetailChart() {
  const chartDom = document.getElementById('detailHealthChart');
  if (!chartDom || !app.selectedMachine) return;

  const myChart = echarts.init(chartDom);

  const machine = app.selectedMachine;
  const healthIndex = machine.healthIndex;

  const option = {
    tooltip: {
      formatter: '{b}: {c}'
    },
    series: [
      {
        type: 'gauge',
        min: 0,
        max: 1,
        splitNumber: 10,
        radius: '90%',
        axisLine: {
          lineStyle: {
            width: 20,
            color: [
              [0.6, chartConfig.colors.danger],
              [0.8, chartConfig.colors.warning],
              [1, chartConfig.colors.success]
            ]
          }
        },
        pointer: {
          itemStyle: {
            color: 'auto'
          },
          width: 4
        },
        axisTick: {
          distance: -20,
          length: 8,
          lineStyle: {
            color: '#fff',
            width: 1
          }
        },
        splitLine: {
          distance: -20,
          length: 20,
          lineStyle: {
            color: '#fff',
            width: 2
          }
        },
        axisLabel: {
          distance: -40,
          color: chartConfig.colors.textSecondary,
          fontSize: 12
        },
        detail: {
          valueAnimation: true,
          formatter: '{value}',
          color: 'inherit',
          fontSize: 30,
          offsetCenter: [0, '0%']
        },
        title: {
          fontSize: 14,
          offsetCenter: [0, '30%'],
          color: chartConfig.colors.textSecondary
        },
        data: [
          {
            value: healthIndex.toFixed(2),
            name: '健康指數'
          }
        ]
      }
    ]
  };

  myChart.setOption(option);

  // 存儲圖表實例
  if (!window.chartInstances) window.chartInstances = {};
  window.chartInstances.detailHealthChart = myChart;
}

// 更新健康指數詳細圖表
function updateHealthDetailChart() {
  if (!window.chartInstances || !window.chartInstances.detailHealthChart || !app.selectedMachine) {
    createHealthDetailChart();
    return;
  }

  const chart = window.chartInstances.detailHealthChart;
  const machine = app.selectedMachine;

  const option = {
    series: [
      {
        data: [
          {
            value: machine.healthIndex.toFixed(2),
            name: '健康指數'
          }
        ]
      }
    ]
  };

  chart.setOption(option);
}

// 創建剩餘壽命圖表（詳細視圖）
function createRulDetailChart() {
  const chartDom = document.getElementById('detailRulChart');
  if (!chartDom || !app.selectedMachine) return;

  const myChart = echarts.init(chartDom);
  const machine = app.selectedMachine;

  // 定義閾值
  const dangerThreshold = 200; // 小於這個值視為危險
  const warningThreshold = 400; // 小於這個值視為警告

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        return `${params[0].value} ${machine.rul.unit}`;
      }
    },
    grid: {
      left: '5%',
      right: '5%',
      bottom: '10%',
      top: '20%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['剩餘使用壽命'],
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      name: machine.rul.unit,
      nameLocation: 'end',
      nameTextStyle: {
        color: chartConfig.colors.textSecondary
      },
      axisLabel: {
        color: chartConfig.colors.textSecondary
      },
      splitLine: {
        lineStyle: {
          color: '#e2e8f0'
        }
      }
    },
    series: [
      {
        type: 'bar',
        barWidth: '70%',
        data: [
          {
            value: machine.rul.value,
            itemStyle: {
              color: machine.rul.value <= dangerThreshold
                ? chartConfig.colors.danger
                : (machine.rul.value <= warningThreshold
                  ? chartConfig.colors.warning
                  : chartConfig.colors.success)
            }
          }
        ],
        markLine: {
          symbol: 'none',
          lineStyle: {
            type: 'dashed'
          },
          data: [
            {
              name: '警告閾值',
              yAxis: warningThreshold,
              lineStyle: {
                color: chartConfig.colors.warning
              },
              label: {
                formatter: '警告閾值',
                position: 'middle',
                color: chartConfig.colors.warning
              }
            },
            {
              name: '危險閾值',
              yAxis: dangerThreshold,
              lineStyle: {
                color: chartConfig.colors.danger
              },
              label: {
                formatter: '危險閾值',
                position: 'middle',
                color: chartConfig.colors.danger
              }
            }
          ]
        }
      }
    ]
  };

  myChart.setOption(option);

  // 存儲圖表實例
  if (!window.chartInstances) window.chartInstances = {};
  window.chartInstances.detailRulChart = myChart;
}

// 更新剩餘壽命圖表
function updateRulDetailChart() {
  if (!window.chartInstances || !window.chartInstances.detailRulChart || !app.selectedMachine) {
    createRulDetailChart();
    return;
  }

  const chart = window.chartInstances.detailRulChart;
  const machine = app.selectedMachine;

  // 定義閾值
  const dangerThreshold = 200; // 小於這個值視為危險
  const warningThreshold = 400; // 小於這個值視為警告

  const option = {
    series: [
      {
        data: [
          {
            value: machine.rul.value,
            itemStyle: {
              color: machine.rul.value <= dangerThreshold
                ? chartConfig.colors.danger
                : (machine.rul.value <= warningThreshold
                  ? chartConfig.colors.warning
                  : chartConfig.colors.success)
            }
          }
        ]
      }
    ]
  };

  chart.setOption(option);
}

// 創建參數儀表盤
function createParameterGauges() {
  if (!app.selectedMachine) return;

  const machine = app.selectedMachine;

  // 溫度儀表盤
  createParameterGauge('tempGauge', machine.parameters.temperature, 0, 100, '°C', [
    { max: 50, color: chartConfig.colors.success },
    { max: 75, color: chartConfig.colors.warning },
    { max: 100, color: chartConfig.colors.danger }
  ]);

  // 震動儀表盤
  createParameterGauge('vibrationGauge', machine.parameters.vibration, 0, 0.5, 'g', [
    { max: 0.2, color: chartConfig.colors.success },
    { max: 0.35, color: chartConfig.colors.warning },
    { max: 0.5, color: chartConfig.colors.danger }
  ]);

  // 壓力儀表盤
  createParameterGauge('pressureGauge', machine.parameters.pressure, 0, 300, 'kPa', [
    { max: 180, color: chartConfig.colors.danger },
    { max: 200, color: chartConfig.colors.warning },
    { max: 300, color: chartConfig.colors.success }
  ]);
}

// 創建單個參數儀表盤
function createParameterGauge(elementId, value, min, max, unit, ranges) {
  const chartDom = document.getElementById(elementId);
  if (!chartDom) return;

  const myChart = echarts.init(chartDom);

  const colors = ranges.map(range => range.color);
  const rangeValues = ranges.map(range => range.max / max);

  // 將顏色和範圍值配對
  const colorStops = [];
  for (let i = 0; i < rangeValues.length; i++) {
    colorStops.push([rangeValues[i], colors[i]]);
  }

  const option = {
    series: [
      {
        type: 'gauge',
        radius: '100%',
        progress: {
          show: true,
          width: 12
        },
        axisLine: {
          lineStyle: {
            width: 12,
            color: colorStops
          }
        },
        axisTick: {
          show: true,
          splitNumber: 5,
          distance: -14
        },
        splitLine: {
          show: true,
          distance: -14,
          length: 10
        },
        axisLabel: {
          distance: -30,
          fontSize: 10,
          color: chartConfig.colors.textSecondary,
          formatter: function(value) {
            return value === max ? value : '';
          }
        },
        anchor: {
          show: false
        },
        pointer: {
          icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
          length: '60%',
          width: 4
        },
        title: {
          show: false
        },
        detail: {
          valueAnimation: true,
          fontSize: 11,
          offsetCenter: [0, '70%'],
          formatter: function(value) {
            return value + ' ' + unit;
          },
          color: 'inherit'
        },
        data: [
          {
            value: value
          }
        ]
      }
    ]
  };

  myChart.setOption(option);

  // 存儲圖表實例
  if (!window.chartInstances) window.chartInstances = {};
  window.chartInstances[elementId] = myChart;
}

// 更新參數儀表盤
function updateParameterGauges() {
  if (!app.selectedMachine) return;

  const machine = app.selectedMachine;

  // 更新溫度儀表盤
  if (window.chartInstances && window.chartInstances.tempGauge) {
    window.chartInstances.tempGauge.setOption({
      series: [{ data: [{ value: machine.parameters.temperature }] }]
    });
  }

  // 更新震動儀表盤
  if (window.chartInstances && window.chartInstances.vibrationGauge) {
    window.chartInstances.vibrationGauge.setOption({
      series: [{ data: [{ value: machine.parameters.vibration }] }]
    });
  }

  // 更新壓力儀表盤
  if (window.chartInstances && window.chartInstances.pressureGauge) {
    window.chartInstances.pressureGauge.setOption({
      series: [{ data: [{ value: machine.parameters.pressure }] }]
    });
  }
}

// 創建歷史趨勢圖表
function createHistoryTrendChart() {
  const chartDom = document.getElementById('historyTrendChart');
  if (!chartDom || !app.selectedMachine) return;

  const myChart = echarts.init(chartDom);
  const machine = app.selectedMachine;

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['健康指數', '剩餘壽命'],
      right: '5%'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: machine.history.timestamps,
      axisLabel: {
        color: chartConfig.colors.textSecondary,
        formatter: function(value) {
          // 簡化日期顯示
          return value.substring(5); // 只顯示月-日部分
        }
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '健康指數',
        min: 0,
        max: 1,
        position: 'left',
        axisLine: {
          show: true,
          lineStyle: {
            color: chartConfig.colors.primary
          }
        },
        axisLabel: {
          formatter: '{value}',
          color: chartConfig.colors.textSecondary
        },
        splitLine: {
          lineStyle: {
            color: '#e2e8f0',
            type: 'dashed'
          }
        }
      },
      {
        type: 'value',
        name: '剩餘壽命',
        min: 0,
        position: 'right',
        axisLine: {
          show: true,
          lineStyle: {
            color: chartConfig.colors.secondary
          }
        },
        axisLabel: {
          formatter: '{value} ' + machine.rul.unit,
          color: chartConfig.colors.textSecondary
        },
        splitLine: {
          show: false
        }
      }
    ],
    series: [
      {
        name: '健康指數',
        type: 'line',
        smooth: true,
        emphasis: {
          focus: 'series'
        },
        yAxisIndex: 0,
        data: machine.history.healthIndex,
        lineStyle: {
          width: 3,
          color: chartConfig.colors.primary
        },
        itemStyle: {
          color: chartConfig.colors.primary
        },
        areaStyle: {
          opacity: 0.2,
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: chartConfig.colors.primary
              },
              {
                offset: 1,
                color: 'rgba(26, 86, 219, 0.1)'
              }
            ]
          }
        }
      },
      {
        name: '剩餘壽命',
        type: 'line',
        smooth: true,
        emphasis: {
          focus: 'series'
        },
        yAxisIndex: 1,
        data: machine.history.rul,
        lineStyle: {
          width: 3,
          color: chartConfig.colors.secondary
        },
        itemStyle: {
          color: chartConfig.colors.secondary
        }
      }
    ]
  };

  myChart.setOption(option);

  // 存儲圖表實例
  if (!window.chartInstances) window.chartInstances = {};
  window.chartInstances.historyTrendChart = myChart;
}

// 更新歷史趨勢圖表
function updateHistoryTrendChart() {
  if (!window.chartInstances || !window.chartInstances.historyTrendChart || !app.selectedMachine) {
    createHistoryTrendChart();
    return;
  }

  const chart = window.chartInstances.historyTrendChart;
  const machine = app.selectedMachine;

  const option = {
    xAxis: {
      data: machine.history.timestamps
    },
    series: [
      {
        name: '健康指數',
        data: machine.history.healthIndex
      },
      {
        name: '剩餘壽命',
        data: machine.history.rul
      }
    ]
  };

  chart.setOption(option);
}

// 工具函數：根據值獲取對應的顏色
function getColorByValue(value) {
  if (value >= 0.8) {
    return chartConfig.colors.success;
  } else if (value >= 0.6) {
    return chartConfig.colors.warning;
  } else {
    return chartConfig.colors.danger;
  }
}

// 視窗大小改變時重置所有圖表
window.addEventListener('resize', function() {
  if (!window.chartInstances) return;

  Object.values(window.chartInstances).forEach(chart => {
    if (chart && chart.resize) {
      chart.resize();
    }
  });
});
