import React, { lazy, Suspense, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Link as RouterLink, Route, Routes, Navigate } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Alert, Box, Button, Chip, CircularProgress, Container, CssBaseline, Stack, ThemeProvider, Typography, createTheme } from '@mui/material';
import { SessionProvider, useSession } from './auth/session.js';
import { LoginPage } from './auth/LoginPage.js';
import './style.css';
const AccountsPage = lazy(() => import('./users/AccountsPage.js'));
const SchoolPage = lazy(() => import('./school/SchoolPage.js'));
const PeoplePage = lazy(() => import('./people/PeoplePage.js'));
const CommercialPage = lazy(() => import('./commercial/CommercialPage.js'));
const EnrollmentPage = lazy(() => import('./enrollment/EnrollmentPage.js'));
const EnvironmentPage = lazy(() => import('./EnvironmentPage.js').then(m => ({ default: m.EnvironmentPage })));
const theme = createTheme({ palette: { primary: { main: '#18574d' }, background: { default: '#f5f6f2' } }, typography: { fontFamily: '"Segoe UI", system-ui, sans-serif', h3: { fontWeight: 650 }, h5: { fontWeight: 600 } }, shape: { borderRadius: 16 }, components: { MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 650 } } } } });
const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
function App() {
  const { user, loading, error, retry, logout } = useSession();
  const [logoutError, setLogoutError] = useState(''); const [leaving, setLeaving] = useState(false);
  if (loading) return <Container sx={{ py: 8 }}><CircularProgress aria-label="Recuperando sessão"/></Container>;
  if (error) return <Container sx={{ py: 8 }}><Alert severity="warning">{error}</Alert><Button onClick={retry}>Tentar novamente</Button></Container>;
  if (!user) return <LoginPage/>;
  const technical = user.role === 'DIRECTOR' || user.role === 'IT';
  return <><Box component="header" sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}><Container maxWidth="lg"><Stack direction={{ xs: 'column', sm: 'row' }} sx={{ py: 2, gap: 2, justifyContent: 'space-between', alignItems: { sm: 'center' } }}>
    <Typography component={RouterLink} to="/" sx={{ fontSize: 22, fontWeight: 800, color: 'primary.main', textDecoration: 'none' }}>SmartSchool.</Typography>
    <Stack direction="row" sx={{ gap: 1, alignItems: 'center', flexWrap: 'wrap' }}><Typography sx={{ overflowWrap: 'anywhere' }}>{user.name}</Typography><Chip size="small" label={{ DIRECTOR: 'Direção', SECRETARY: 'Secretaria', IT: 'TI' }[user.role]}/><Button disabled={leaving} onClick={() => { setLeaving(true); setLogoutError(''); void logout().then(() => client.clear()).catch(() => setLogoutError('Não foi possível confirmar a saída. Tente novamente.')).finally(() => setLeaving(false)); }}>{leaving ? 'Saindo…' : 'Sair'}</Button></Stack>
  </Stack></Container></Box>
  <Container maxWidth="lg" sx={{ py: 2 }}><Stack component="nav" aria-label="Navegação principal" direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}><Button component={RouterLink} to="/">Início</Button>{['DIRECTOR', 'SECRETARY'].includes(user.role) && <><Button component={RouterLink} to="/pessoas">Pessoas e vínculos</Button><Button component={RouterLink} to="/matriculas">Matrículas em andamento</Button>{user.role === 'DIRECTOR' && <><Button component={RouterLink} to="/estrutura">Estrutura escolar</Button><Button component={RouterLink} to="/campanhas">Campanhas e planos</Button><Button component={RouterLink} to="/contas">Contas e auditoria</Button></>}</>}{technical && <Button component={RouterLink} to="/ambiente">Ambiente técnico</Button>}</Stack>{logoutError && <Alert severity="error">{logoutError}</Alert>}</Container>
  <Box component="main"><Suspense fallback={<Container sx={{ py: 4 }}><CircularProgress aria-label="Carregando página"/></Container>}><Routes>
    <Route path="/" element={<Container maxWidth="lg" sx={{ py: 5 }}><Typography variant="overline" color="primary">SEU ESPAÇO DE TRABALHO</Typography><Typography variant="h3" component="h1" sx={{ mt: 1, mb: 2, fontSize: { xs: 34, md: 46 } }}>Bom ter você por aqui.</Typography><Typography color="text.secondary" sx={{ mb: 4 }}>Acesso individual, responsabilidades claras e um começo bem organizado.</Typography><Alert severity="info" variant="outlined">Cadastros de pessoas, estrutura escolar, campanhas e matrícula em andamento estão disponíveis para validação com dados fictícios. Confirmação, cobrança e pagamento permanecem fora desta etapa.</Alert></Container>}/>
    <Route path="/estrutura" element={user.role === 'DIRECTOR' ? <SchoolPage/> : <Navigate to="/" replace/>}/>
    <Route path="/pessoas" element={['DIRECTOR', 'SECRETARY'].includes(user.role) ? <PeoplePage/> : <Navigate to="/" replace/>}/>
    <Route path="/matriculas" element={['DIRECTOR', 'SECRETARY'].includes(user.role) ? <EnrollmentPage/> : <Navigate to="/" replace/>}/>
    <Route path="/campanhas" element={user.role === 'DIRECTOR' ? <CommercialPage/> : <Navigate to="/" replace/>}/>
    <Route path="/contas" element={user.role === 'DIRECTOR' ? <AccountsPage/> : <Navigate to="/" replace/>}/>
    <Route path="/ambiente" element={technical ? <EnvironmentPage/> : <Navigate to="/" replace/>}/>
    <Route path="*" element={<Container sx={{ py: 5 }}><Typography component="h1" variant="h4">Página não encontrada</Typography><Button component={RouterLink} to="/">Voltar ao início</Button></Container>}/>
  </Routes></Suspense></Box></>;
}
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><ThemeProvider theme={theme}><CssBaseline/><QueryClientProvider client={client}><SessionProvider><BrowserRouter><App/></BrowserRouter></SessionProvider></QueryClientProvider></ThemeProvider></React.StrictMode>);
