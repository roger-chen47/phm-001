/* PHM Edge系統儀表板 - 主應用 */

// 等待DOM加載完成
document.addEventListener('DOMContentLoaded', function() {
  // 創建Vue實例
  const { createApp } = Vue;

  // 初始化Vue應用
  const appInstance = createApp({
    // 數據
    data() {
      return {
        // 視圖控制
        currentView: 'overview',  // 'overview' 或 'detail'
        selectedMachine: null,    // 選中的機台
        loading: false,           // 載入狀態
        timeRange: 'week',        // 時間範圍：'day', 'week', 'month'

        // 主數據
        machines: [],             // 機台數據
        alerts: [],               // 警報數據

        // 頁面狀態
        lastUpdated: '',          // 最後更新時間
        currentDate: formatDate(new Date()),  // 當前日期

        // 定時器
        dataRefreshInterval: null  // 數據刷新定時器
      };
    },

    // 計算屬性
    computed: {
      // 按狀態統計機台數量
      machineStatusCounts() {
        const counts = { normal: 0, warning: 0, danger: 0, total: this.machines.length };

        this.machines.forEach(machine => {
          if (counts.hasOwnProperty(machine.status)) {
            counts[machine.status]++;
          }
        });

        return counts;
      },

      // 計算全局平均健康指數
      averageHealthIndex() {
        if (this.machines.length === 0) return 0;

        const total = this.machines.reduce((sum, machine) => sum + machine.healthIndex, 0);
        return total / this.machines.length;
      }
    },

    // 監聽屬性變化
    watch: {
      // 監聽選中機台變化
      selectedMachine(newMachine) {
        if (newMachine) {
          this.currentView = 'detail';
          // 下一個Vue更新周期後初始化詳細視圖圖表
          this.$nextTick(() => {
            initDetailCharts();
          });
        }
      },

      // 監聽視圖變化
      currentView(newView) {
        // 下一個Vue更新周期後初始化對應視圖的圖表
        this.$nextTick(() => {
          if (newView === 'overview') {
            initOverviewCharts();
          } else if (newView === 'detail' && this.selectedMachine) {
            initDetailCharts();
          }
        });
      }
    },

    // 方法
    methods: {
      // 選中機台
      selectMachine(machine) {
        this.selectedMachine = machine;
      },

      // 獲取狀態文本
      getStatusText(status) {
        switch(status) {
          case 'normal': return '正常';
          case 'warning': return '警告';
          case 'danger': return '危險';
          default: return '未知';
        }
      },

      // 獲取下一次維護日期（基於RUL計算）
      getNextMaintenanceDate(rulHours) {
        const now = new Date();
        const maintenanceDate = new Date(now.getTime() + rulHours * 60 * 60 * 1000); // 轉換小時為毫秒
        return formatDate(maintenanceDate);
      },

      // 加載數據
      async loadData() {
        this.loading = true;

        try {
          // 從JSON文件加載機台數據
          const response = await fetch('assets/data/machines.json');
          const data = await response.json();

          if (data && data.machines) {
            // 更新機台數據
            this.machines = data.machines;

            // 如果之前選中了機台，更新選中的機台數據
            if (this.selectedMachine) {
              const updatedMachine = this.machines.find(m => m.id === this.selectedMachine.id);
              if (updatedMachine) {
                this.selectedMachine = updatedMachine;
              }
            }

            // 生成警報數據（基於機台健康狀態）
            this.generateAlerts();

            // 更新最後更新時間
            this.lastUpdated = formatDateTime(new Date());

            // 下一個Vue更新周期後更新圖表
            this.$nextTick(() => {
              updateCharts();
            });
          }
        } catch (error) {
          console.error('加載數據失敗:', error);
        } finally {
          this.loading = false;
        }
      },

      // 生成警報數據
      generateAlerts() {
        // 清空警報列表
        this.alerts = [];

        // 基於機台狀態生成警報
        this.machines.forEach(machine => {
          if (machine.status === 'danger') {
            this.alerts.push({
              machineId: machine.id,
              type: '嚴重問題',
              message: `${machine.name} 健康指數嚴重降低，需要立即維護！`,
              time: formatDateTime(new Date()),
              priority: 'high'
            });
          } else if (machine.status === 'warning') {
            this.alerts.push({
              machineId: machine.id,
              type: '性能警告',
              message: `${machine.name} 健康指數下降，建議安排檢查。`,
              time: formatDateTime(new Date()),
              priority: 'medium'
            });
          }

          // 基於剩餘壽命生成警報
          if (machine.rul.value <= 200) {
            this.alerts.push({
              machineId: machine.id,
              type: '壽命警告',
              message: `${machine.name} 剩餘使用壽命僅剩 ${machine.rul.value} 小時，需要規劃更換。`,
              time: formatDateTime(new Date()),
              priority: machine.rul.value <= 100 ? 'high' : 'medium'
            });
          }
        });
      },

      // 手動刷新數據
      refreshData() {
        // 添加loading類以觸發旋轉動畫
        const refreshBtn = document.querySelector('.refresh-btn');
        if (refreshBtn) {
          refreshBtn.classList.add('loading');
        }

        // 加載數據
        this.loadData().then(() => {
          // 移除loading類
          if (refreshBtn) {
            setTimeout(() => {
              refreshBtn.classList.remove('loading');
            }, 1000);
          }
        });
      },

      // 模擬數據變化（用於演示）
      simulateDataChange() {
        if (!this.machines || this.machines.length === 0) return;

        // 為每個機台的參數添加隨機波動
        this.machines.forEach(machine => {
          // 隨機波動健康指數（小範圍）
          const healthDelta = (Math.random() - 0.5) * 0.02; // -0.01 到 0.01 之間
          machine.healthIndex = Math.max(0, Math.min(1, machine.healthIndex + healthDelta));

          // 根據健康指數趨勢調整RUL
          if (healthDelta < 0) {
            // 健康下降，壽命減少得更快
            machine.rul.value = Math.max(0, machine.rul.value - Math.random() * 10);
          } else {
            // 健康提升，壽命減少得較慢
            machine.rul.value = Math.max(0, machine.rul.value - Math.random() * 5);
          }

          // 隨機波動參數
          machine.parameters.temperature += (Math.random() - 0.5) * 2;
          machine.parameters.vibration += (Math.random() - 0.5) * 0.03;
          machine.parameters.pressure += (Math.random() - 0.5) * 5;

          // 更新機台狀態（基於健康指數）
          if (machine.healthIndex < 0.6) {
            machine.status = 'danger';
          } else if (machine.healthIndex < 0.8) {
            machine.status = 'warning';
          } else {
            machine.status = 'normal';
          }
        });

        // 更新圖表
        this.$nextTick(() => {
          updateCharts();
        });

        // 重新生成警報
        this.generateAlerts();

        // 更新最後更新時間
        this.lastUpdated = formatDateTime(new Date());
      }
    },

    // 生命周期鉤子
    mounted() {
      // 首次加載數據
      this.loadData();

      // 設置定時刷新（30秒一次）
      this.dataRefreshInterval = setInterval(() => {
        // 在實際應用中，這裡會重新加載後端數據
        // 但在示例中，我們使用模擬數據變化來演示效果
        this.simulateDataChange();
      }, 30000);

      // 初始化圖表
      this.$nextTick(() => {
        if (typeof initCharts === 'function') {
          initCharts();
        }
      });
    },
    beforeUnmount: function() {
      // 清除定時刷新
      if (this.dataRefreshInterval) {
        clearInterval(this.dataRefreshInterval);
      }
    }
  });

  // 註冊全局組件
  if (typeof registerComponents === 'function') {
    registerComponents(appInstance); // 使用 appInstance 註冊組件
  }

  window.app = appInstance.mount('#app');
});

// ----- 工具函數 -----

// 格式化日期（YYYY-MM-DD）
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

// 格式化日期時間（YYYY-MM-DD HH:MM:SS）
function formatDateTime(date) {
  const dateStr = formatDate(date);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${dateStr} ${hours}:${minutes}:${seconds}`;
}
