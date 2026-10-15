import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link as RouterLink } from 'react-router';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { Alert, Box, Button, Chip, Container, CssBaseline, Paper, Stack, ThemeProvider, Typography, createTheme } from '@mui/material';
import { environmentStatusSchema } from '@smartschool/contracts';
import './style.css';

const theme = createTheme({
  palette: { primary: { main: '#18574d' }, background: { default: '#f5f6f2' } },
  typography: { fontFamily: '"Segoe UI", system-ui, sans-serif', h3: { fontWeight: 650 }, h5: { fontWeight: 600 } },
  shape: { borderRadius: 16 },
});
const client = new QueryClient();
function EnvironmentPage() {
  const query = useQuery({
    queryKey: ['environment'],
    queryFn: async ({ signal }) => {
      const response = await fetch('/api/v1/status', { signal: AbortSignal.any([signal, AbortSignal.timeout(7000)]) });
      if (!response.ok) throw new Error('API indisponível');
      return environmentStatusSchema.parse(await response.json());
    },
    retry: false, refetchInterval: 10000,
  });
  const info = query.data;
  const failed = query.isError;
  const ready = !failed && info?.status === 'ready';
  const pending = query.isPending;
  const services = [
    { name: 'Aplicação', description: 'Comunicação com a API', ok: !failed && !!info },
    { name: 'Banco de dados', description: 'Conexão e inicialização', ok: !failed && info?.services.database === 'available' },
    { name: 'Arquivos', description: 'Armazenamento privado', ok: !failed && info?.services.storage === 'available' },
  ];
  return <Container maxWidth="md" sx={{ py: { xs: 3, sm: 6 } }}>
    <Stack direction="row" sx={{ mb: 7, justifyContent: "space-between", alignItems: "center" }}>
      <Typography sx={{ fontWeight: 750, fontSize: 22 }}>SmartSchool<span className="brand-dot">.</span></Typography>
      <Chip label="Ambiente local" variant="outlined" size="small"/>
    </Stack>
    <Typography variant="overline" color="primary">MD-01 · Fundação</Typography>
    <Typography variant="h3" component="h1" sx={{ mt: 1, mb: 2, fontSize: { xs: 32, sm: 44 } }}>Um começo bem organizado.</Typography>
    <Typography color="text.secondary" sx={{ maxWidth: 620, mb: 4 }}>Este painel verifica os serviços que vão sustentar o sistema da escola. A primeira etapa é deixar o ambiente pronto e preservar os dados entre reinícios.</Typography>
    <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 4 }, mb: 3 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ mb: 3, justifyContent: "space-between", gap: 2 }}>
        <Box role="status" aria-live="polite">
          <Typography variant="h5" component="h2">{pending ? 'Verificando o ambiente' : ready ? 'Ambiente pronto' : 'Ambiente precisa de atenção'}</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>{pending ? 'Consultando os serviços…' : ready ? 'Os serviços da fundação estão disponíveis.' : 'Confira os serviços abaixo e tente atualizar.'}</Typography>
        </Box>
        <Button variant="outlined" onClick={() => void query.refetch()} disabled={query.isFetching} sx={{ alignSelf: 'flex-start', whiteSpace: 'nowrap' }}>{query.isFetching ? 'Verificando…' : 'Atualizar estado'}</Button>
      </Stack>
      <Box className="service-grid">
        {services.map(service => <Box className="service-card" key={service.name}>
          <span aria-hidden="true" className={'status-dot ' + (!pending && service.ok ? 'on' : 'off')}/>
          <Typography component="h3" sx={{ mt: 2, fontWeight: 650 }}>{service.name}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ my: 1 }}>{service.description}</Typography>
          <Chip size="small" label={pending ? 'Verificando' : service.ok ? 'Disponível' : 'Indisponível'} color={pending ? 'default' : service.ok ? 'success' : 'warning'} variant="outlined"/>
        </Box>)}
      </Box>
      {failed && <Alert severity="warning" sx={{ mt: 3 }}>Não foi possível consultar a aplicação. Verifique se o ambiente está iniciado e use “Atualizar estado”.</Alert>}
      {!failed && info?.status === 'degraded' && <Alert severity="warning" sx={{ mt: 3 }}>Um serviço não respondeu ou ainda não foi inicializado. Consulte o guia da MD-01 para recuperar o ambiente.</Alert>}
      {!failed && info?.installation && <Box sx={{ mt: 3 }}><Typography variant="body2" color="text.secondary">Identificador do ambiente</Typography><Typography variant="body2" sx={{ overflowWrap: 'anywhere', fontFamily: 'monospace' }} data-testid="installation-id">{info.installation.id}</Typography><Typography variant="caption" color="text.secondary">Este identificador deve permanecer igual após reiniciar.</Typography></Box>}
      {!failed && info && <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block" }}>Última consulta: {new Date(info.checkedAt).toLocaleTimeString('pt-BR')}</Typography>}
    </Paper>
    <Alert severity="info" variant="outlined">Esta entrega valida apenas a fundação. Matrículas, pagamentos e acesso por usuário serão desenvolvidos nas próximas etapas. Use somente exemplos fictícios.</Alert>
    <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>Próxima etapa prevista: acesso e auditoria básica, após validação desta entrega.</Typography>
  </Container>;
}
function App() { return <ThemeProvider theme={theme}><CssBaseline/><QueryClientProvider client={client}><BrowserRouter><Routes><Route path="/" element={<EnvironmentPage/>}/><Route path="*" element={<Container sx={{ py: 6 }}><Typography variant="h4" component="h1">Página não encontrada</Typography><Button component={RouterLink} to="/">Voltar ao ambiente</Button></Container>}/></Routes></BrowserRouter></QueryClientProvider></ThemeProvider>; }
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
