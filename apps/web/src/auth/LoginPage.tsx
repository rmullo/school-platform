import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { loginSchema } from '@smartschool/contracts';
import { Alert, Box, Button, Container, Paper, Stack, TextField, Typography } from '@mui/material';
import { useSession } from './session.js';

export function LoginPage() {
  const session = useSession();
  const [error, setError] = useState('');
  const form = useForm<{ email: string; password: string }>({ defaultValues: { email: '', password: '' } });
  return <Container maxWidth="lg" sx={{ minHeight: '100dvh', display: 'grid', alignItems: 'center', py: 4 }}>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.1fr 1fr' }, gap: { xs: 4, md: 10 }, alignItems: 'center' }}>
      <Box><Typography color="primary" sx={{ fontWeight: 800, fontSize: 24, mb: 5 }}>SmartSchool.</Typography>
        <Typography variant="overline" color="primary">CUIDADO EM CADA ETAPA</Typography>
        <Typography component="h1" sx={{ fontSize: { xs: 36, md: 58 }, lineHeight: 1.1, fontWeight: 700, letterSpacing: '-0.04em', my: 2 }}>Mais clareza.<br/>Mais tempo para<br/>a sua escola.</Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 420 }}>Um espaço organizado para a equipe trabalhar, com acessos individuais e responsabilidades bem definidas.</Typography>
      </Box>
      <Paper variant="outlined" sx={{ p: { xs: 3, sm: 5 }, borderRadius: 5 }}>
        <Typography component="h2" variant="h5">Bem-vindo de volta</Typography><Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>Entre com a sua conta de trabalho.</Typography>
        <Stack component="form" noValidate spacing={2.5} onSubmit={form.handleSubmit(async values => {
          setError(''); const parsed = loginSchema.safeParse(values);
          if (!parsed.success) { for (const issue of parsed.error.issues) { const field = issue.path[0] === 'email' ? 'email' : 'password'; form.setError(field, { message: field === 'email' ? 'Informe um e-mail válido.' : 'Informe a senha.' }, { shouldFocus: true }); } return; }
          try { await session.login(parsed.data.email, parsed.data.password); form.reset(); } catch (failure) { setError(failure instanceof Error ? failure.message : 'Não foi possível entrar.'); }
        })}>
          <TextField label="E-mail" type="email" autoComplete="username" {...form.register('email')} error={!!form.formState.errors.email} helperText={form.formState.errors.email?.message}/>
          <TextField label="Senha" type="password" autoComplete="current-password" {...form.register('password')} error={!!form.formState.errors.password} helperText={form.formState.errors.password?.message}/>
          {error && <Alert severity="error" role="alert">{error}</Alert>}
          <Button type="submit" size="large" variant="contained" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? 'Entrando…' : 'Entrar'}</Button>
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3 }}>Precisa de acesso? Procure a Direção da escola.</Typography>
      </Paper>
    </Box>
  </Container>;
}
