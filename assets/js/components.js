/* PHM Edge系統儀表板 - Vue組件 */

// 機台卡片組件
const MachineCard = {
  props: {
    machine: {
      type: Object,
      required: true
    }
  },
  template: `
    <div class="machine-card" :class="machine.status" @click="$emit('select', machine)">
      <div class="machine-header">
        <h3>{{ machine.name }}</h3>
        <span class="machine-id">ID: {{ machine.id }}</span>
      </div>
      <div class="machine-body">
        <div class="machine-info">
          <p>型號: {{ machine.model }}</p>
          <p>位置: {{ machine.location }}</p>
        </div>
        <div class="machine-health">
          <div class="health-gauge">
            <div class="gauge-chart" :id="'gauge-' + machine.id"></div>
            <div class="gauge-value">{{ (machine.healthIndex * 100).toFixed(0) }}%</div>
          </div>
          <div class="rul-info">
            <span>剩餘壽命:</span>
            <strong>{{ machine.rul.value }} {{ machine.rul.unit }}</strong>
          </div>
        </div>
      </div>
      <div class="machine-status-indicator">
        <span :class="'status-' + machine.status">
          {{ getStatusText(machine.status) }}
        </span>
      </div>
    </div>
  `,
  methods: {
    getStatusText(status) {
      switch(status) {
        case 'normal': return '正常';
        case 'warning': return '警告';
        case 'danger': return '危險';
        default: return '未知';
      }
    }
  },
  mounted() {
    // 在組件掛載後初始化儀表盤圖表
    this.$nextTick(() => {
      if (typeof createGaugeChart === 'function') {
        createGaugeChart(`gauge-${this.machine.id}`, this.machine.healthIndex);
      }
    });
  },
  updated() {
    // 在組件更新後更新儀表盤圖表
    this.$nextTick(() => {
      if (typeof updateGaugeChart === 'function') {
        updateGaugeChart(`gauge-${this.machine.id}`, this.machine.healthIndex);
      }
    });
  }
};

// 警報項組件
const AlertItem = {
  props: {
    alert: {
      type: Object,
      required: true
    }
  },
  template: `
    <tr :class="'priority-' + alert.priority">
      <td>{{ alert.machineId }}</td>
      <td>{{ alert.type }}</td>
      <td>{{ alert.message }}</td>
      <td>{{ alert.time }}</td>
    </tr>
  `
};

// 參數儀表盤組件
const ParameterGauge = {
  props: {
    name: {
      type: String,
      required: true
    },
    value: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      required: true
    },
    gaugeId: {
      type: String,
      required: true
    }
  },
  template: `
    <div class="parameter-item">
      <span class="parameter-name">{{ name }}</span>
      <div class="parameter-gauge" :id="gaugeId"></div>
      <span class="parameter-value">{{ value }} {{ unit }}</span>
    </div>
  `,
  mounted() {
    // 在組件掛載後初始化參數儀表盤
    this.$nextTick(() => {
      if (window.app && window.app.selectedMachine) {
        // 這部分將依賴於charts.js中定義的函數
        // 在main.js中設置組件之後將確保這些函數可用
      }
    });
  }
};

// 數據載入中覆蓋組件
const LoadingOverlay = {
  template: `
    <div class="loading-overlay">
      <div class="loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  `
};

// 註冊全局組件
function registerComponents(app) {
  app.component('machine-card', MachineCard);
  app.component('alert-item', AlertItem);
  app.component('parameter-gauge', ParameterGauge);
  app.component('loading-overlay', LoadingOverlay);
}
