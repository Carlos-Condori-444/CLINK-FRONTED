import { Component, input } from '@angular/core';
@Component({
  selector: 'app-icon',
  host: { 'aria-hidden': 'true', style: 'display:inline-flex;vertical-align:middle;flex-shrink:0' },
  template: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path [attr.d]="paths[name()] || paths['link']" /></svg>`
})
export class IconComponent {
  readonly name = input('link');
  readonly paths: Record<string, string> = {
    grid: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
    link: 'M10 13a5 5 0 007 0l3-3a5 5 0 00-7-7l-2 2 M14 11a5 5 0 00-7 0l-3 3a5 5 0 007 7l2-2',
    chart: 'M4 3v18h17 M9 16v-5 M14 16V7 M19 16V4',
    qr: 'M3 3h6v6H3z M15 3h6v6h-6z M3 15h6v6H3z M15 15h2v2h-2z M21 14v4h-3v3h-4 M21 21h.01',
    plus: 'M12 5v14 M5 12h14', arrow: 'M5 12h14 M13 6l6 6-6 6',
    logout: 'M9 4H4v16h5 M10 12h11 M17 8l4 4-4 4',
    refresh: 'M20 7v5h-5 M4 17v-5h5 M6 6a8 8 0 0113 1 M18 18A8 8 0 015 17',
    search: 'M10 18a8 8 0 100-16 8 8 0 000 16 M16 16l6 6',
    copy: 'M9 9h12v12H9z M15 9V3H3v12h6',
    trash: 'M3 6h18 M9 6V3h6v3 M5 6l1 15h12l1-15 M10 10v7 M14 10v7',
    cursor: 'M4 3l6 17 3-7 7-3z M13 13l6 6', check: 'M5 12l4 4L19 6',
    close: 'M6 6l12 12 M18 6L6 18', download: 'M12 3v12 M7 10l5 5 5-5 M4 16v5h16v-5',
    menu: 'M4 6h16 M4 12h16 M4 18h16', spark: 'M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z'
  };
}
