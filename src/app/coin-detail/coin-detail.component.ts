import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { ApiService } from '../core/api.service';
import { Subject, takeUntil } from 'rxjs';

interface CryptoDetail {
  id: string;
  name: string;
  symbol: string;
  logo: string;
  priceUsd: number;
  priceBrl: number;
  variation24h: number;
  marketCap: number;
  volume: number;
  supply: number;
  maxSupply: number;
  links: {
    website?: string;
    explorer?: string;
    github?: string;
  };
  isFavorite: boolean;
}

@Component({
  selector: 'app-coin-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    BaseChartDirective
  ],
  templateUrl: './coin-detail.component.html',
  styleUrls: ['./coin-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoinDetailComponent implements OnInit, OnDestroy {
  crypto?: CryptoDetail;
  isLoading = true;
  cryptoId: string = '';

  // Conversor
  amountControl = new FormControl(1);
  currencyControl = new FormControl('BRL');
  convertedValue: number = 0;

  // Gráfico 30 dias
  chartData?: ChartConfiguration<'line'>['data'];
  chartOptions: ChartConfiguration<'line'>['options'];

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: 'index',
          intersect: false,
        }
      },
      scales: {
        x: { 
          display: true,
          grid: { display: false }
        },
        y: { 
          display: true,
          ticks: {
            callback: (value) => '$' + value.toLocaleString()
          }
        }
      }
    };
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.cryptoId = params['id'];
      this.loadCryptoDetails();
      this.loadHistoricalData();
    });

    this.setupConverter();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCryptoDetails(): void {
    this.isLoading = true;
    
    this.apiService.getCryptoDetails(this.cryptoId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.crypto = data;
          this.isLoading = false;
          this.updateConversion();
        },
        error: (error) => {
          console.error('Error loading crypto details:', error);
          this.isLoading = false;
        }
      });
  }

  loadHistoricalData(): void {
    this.apiService.getHistoricalData(this.cryptoId, 30)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          const prices = data.prices || [];
          const labels = prices.map((p: any) => new Date(p[0]).toLocaleDateString());
          const values = prices.map((p: any) => p[1]);

          this.chartData = {
            labels: labels,
            datasets: [{
              data: values,
              borderColor: '#1976d2',
              backgroundColor: 'rgba(25, 118, 210, 0.1)',
              fill: true,
              tension: 0.4
            }]
          };
        },
        error: (error) => {
          console.error('Error loading historical data:', error);
        }
      });
  }

  setupConverter(): void {
    this.amountControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateConversion());

    this.currencyControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateConversion());
  }

  updateConversion(): void {
    if (!this.crypto) return;

    const amount = this.amountControl.value || 0;
    const currency = this.currencyControl.value;

    if (currency === 'BRL') {
      this.convertedValue = amount * this.crypto.priceBrl;
    } else if (currency === 'USD') {
      this.convertedValue = amount * this.crypto.priceUsd;
    }
  }

  toggleFavorite(): void {
    if (!this.crypto) return;

    const request = this.crypto.isFavorite
      ? this.apiService.removeFavorite(this.crypto.id)
      : this.apiService.addFavorite(this.crypto.id);

    request.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        if (this.crypto) {
          this.crypto.isFavorite = !this.crypto.isFavorite;
        }
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}