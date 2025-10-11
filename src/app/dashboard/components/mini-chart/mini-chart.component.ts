import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-mini-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="mini-chart-container">
      <canvas 
        *ngIf="chartData"
        baseChart
        [data]="chartData"
        [options]="chartOptions"
        [type]="'line'">
      </canvas>
    </div>
  `,
  styles: [`
    .mini-chart-container {
      width: 80px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    canvas {
      max-width: 100%;
      max-height: 100%;
    }
  `]
})
export class MiniChartComponent implements OnChanges {
  @Input() data: number[] = [];
  @Input() positive: boolean = true;

  chartData?: ChartConfiguration<'line'>['data'];
  chartOptions: ChartConfiguration<'line'>['options'];

  constructor() {
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      },
      scales: {
        x: { display: false },
        y: { display: false }
      },
      elements: {
        point: { radius: 0 },
        line: {
          borderWidth: 1.5,
          tension: 0.4
        }
      }
    };
  }

  ngOnChanges(): void {
    if (this.data && this.data.length > 0) {
      const color = this.positive ? '#16c784' : '#ea3943';
      
      this.chartData = {
        labels: this.data.map((_, i) => i.toString()),
        datasets: [{
          data: this.data,
          borderColor: color,
          backgroundColor: 'transparent',
          fill: false
        }]
      };
    }
  }
}