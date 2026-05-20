import { useState } from 'react';
import { Box, Paper, Stack, TextField, Button, Typography, Grid, Alert } from '@mui/material';
import { Download, Assessment } from '@mui/icons-material';
import { reportsApi } from '../../api/endpoints';
import { useAppDispatch } from '../../store';
import { showSnackbar } from '../../store/snackbarSlice';

function isoToday() { return new Date().toISOString().slice(0, 10); }
function isoMonthAgo() {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().slice(0, 10);
}

export default function AdminReports() {
  const dispatch = useAppDispatch();
  const [from, setFrom] = useState(isoMonthAgo());
  const [to, setTo] = useState(isoToday());
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<any | null>(null);

  async function loadStats() {
    setLoading(true);
    try {
      const r = await reportsApi.analytics({ from, to });
      setAnalytics(r);
    } finally {
      setLoading(false);
    }
  }

  async function downloadPdf() {
    try {
      const blob = await reportsApi.downloadSalesPdf({ from, to });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sales-report-${from}_${to}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      dispatch(showSnackbar({ message: 'Отчёт скачан', severity: 'success' }));
    } catch {
      dispatch(showSnackbar({ message: 'Не удалось скачать отчёт', severity: 'error' }));
    }
  }

  return (
    <Box>
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Конструктор отчёта по продажам</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'flex-end' }}>
          <TextField type="date" label="С" InputLabelProps={{ shrink: true }} value={from} onChange={(e) => setFrom(e.target.value)} />
          <TextField type="date" label="По" InputLabelProps={{ shrink: true }} value={to} onChange={(e) => setTo(e.target.value)} />
          <Button variant="outlined" startIcon={<Assessment />} onClick={loadStats} disabled={loading}>
            {loading ? 'Считаем…' : 'Рассчитать'}
          </Button>
          <Button variant="contained" color="secondary" startIcon={<Download />} onClick={downloadPdf}>
            Скачать PDF
          </Button>
        </Stack>
      </Paper>

      {analytics && (
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={4}>
            <Paper variant="outlined" sx={{ p: 2.5 }}>
              <Typography variant="caption" color="text.secondary">Общая выручка</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>{Number(analytics.totalRevenue).toFixed(2)} BYN</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper variant="outlined" sx={{ p: 2.5 }}>
              <Typography variant="caption" color="text.secondary">Заказов</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>{analytics.totalOrders}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper variant="outlined" sx={{ p: 2.5 }}>
              <Typography variant="caption" color="text.secondary">Средний чек</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>{Number(analytics.avgCheck).toFixed(2)} BYN</Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      {!analytics && (
        <Alert severity="info">
          Выберите диапазон дат и нажмите <b>Рассчитать</b> — увидите сводную статистику. Или сразу скачайте PDF-отчёт.
        </Alert>
      )}
    </Box>
  );
}
