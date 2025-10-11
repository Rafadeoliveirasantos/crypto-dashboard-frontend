import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// ✅ ADICIONE ESTAS LINHAS:
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

// OU (se a versão for diferente):
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));