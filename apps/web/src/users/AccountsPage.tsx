import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createUserSchema, publicUserSchema, type PublicUser, type Role } from '@smartschool/contracts';
import { z } from 'zod';
import { Alert, Box, Button, Chip, Container, Dialog, DialogActions, DialogContent, DialogTitle, Divider, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { api } from '../auth/session.js';

const labels: Record<Role, string> = { DIRECTOR: 'Direção', SECRETARY: 'Secretaria', IT: 'TI' };
const auditSchema = z.array(z.object({ id: z.string(), actorId: z.string().nullable(), targetId: z.string(), action: z.string(), reason: z.string(), createdAt: z.string() }));
const actions: Record<string, string> = { LOGIN: 'Entrada', LOGOUT: 'Saída', BOOTSTRAP: 'Primeiro Diretor', USER_CREATED: 'Conta criada', USER_UPDATED: 'Conta alterada', SESSIONS_REVOKED: 'Sessões revogadas', REFRESH_REPLAY: 'Reutilização de sessão bloqueada' };
export default function AccountsPage() {
  const client = useQueryClient();
  const users = useQuery({ queryKey: ['users'], queryFn: async () => z.array(publicUserSchema).parse(await api('users')) });
  const audit = useQuery({ queryKey: ['audit'], queryFn: async () => auditSchema.parse(await api('audit')) });
  const [error, setError] = useState(''); const [success, setSuccess] = useState('');
  const [selected, setSelected] = useState<PublicUser | null>(null); const [role, setRole] = useState<Role>('SECRETARY');
  const [active, setActive] = useState(true); const [reason, setReason] = useState(''); const [busy, setBusy] = useState(false);
  const form = useForm<{ name: string; email: string; password: string; role: Role }>({ defaultValues: { name: '', email: '', password: '', role: 'SECRETARY' } });
  const refresh = async () => { await Promise.all([client.invalidateQueries({ queryKey: ['users'] }), client.invalidateQueries({ queryKey: ['audit'] })]); };
  const change = async (revoke: boolean) => {
    if (!selected || reason.trim().length < 5) { setError('Descreva o motivo com pelo menos cinco caracteres.'); return; }
    setBusy(true); setError(''); setSuccess('');
    try { await api('users/' + selected.id + (revoke ? '/revoke' : ''), { method: revoke ? 'POST' : 'PATCH', body: JSON.stringify(revoke ? { reason } : { role, active, reason }) }); setSelected(null); setSuccess(revoke ? 'Sessões encerradas.' : 'Conta atualizada. As sessões anteriores foram encerradas.'); await refresh(); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Não foi possível alterar a conta.'); }
    finally { setBusy(false); }
  };
  return <Container maxWidth="lg" sx={{ py: 4 }}>
    <Typography variant="overline" color="primary">EQUIPE E RESPONSABILIDADES</Typography><Typography component="h1" variant="h3" sx={{ fontSize: { xs: 32, md: 42 }, mt: 1, mb: 2 }}>Contas e auditoria</Typography><Typography color="text.secondary" sx={{ mb: 4 }}>Gerencie quem pode entrar e acompanhe as alterações. Cada pessoa deve usar a sua própria conta.</Typography>
    {error && !selected && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}{success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) minmax(0, 1.4fr)' }, gap: 3, alignItems: 'start' }}>
      <Paper variant="outlined" sx={{ p: 3 }}><Typography component="h2" variant="h5" sx={{ mb: 3 }}>Adicionar pessoa</Typography>
        <Stack component="form" noValidate spacing={2} onSubmit={form.handleSubmit(async values => {
          setError(''); setSuccess(''); const parsed = createUserSchema.safeParse(values);
          if (!parsed.success) { for (const issue of parsed.error.issues) { const field = issue.path[0] as keyof typeof values; if (['name', 'email', 'password', 'role'].includes(field)) form.setError(field, { message: field === 'password' ? 'Use entre 12 e 128 caracteres.' : 'Confira este campo.' }, { shouldFocus: true }); } return; }
          try { await api('users', { method: 'POST', body: JSON.stringify(parsed.data) }); form.reset(); setSuccess('Conta criada. Compartilhe a senha inicial por um canal privado.'); await refresh(); }
          catch (failure) { setError(failure instanceof Error ? failure.message : 'Não foi possível criar a conta.'); }
        })}>
          <TextField label="Nome" autoComplete="off" {...form.register('name')} error={!!form.formState.errors.name} helperText={form.formState.errors.name?.message}/>
          <TextField label="E-mail" type="email" autoComplete="off" {...form.register('email')} error={!!form.formState.errors.email} helperText={form.formState.errors.email?.message}/>
          <TextField label="Senha inicial" type="password" autoComplete="new-password" {...form.register('password')} error={!!form.formState.errors.password} helperText={form.formState.errors.password?.message ?? 'De 12 a 128 caracteres.'}/>
          <TextField select label="Perfil" defaultValue="SECRETARY" {...form.register('role')}>{Object.entries(labels).map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}</TextField>
          <Button variant="contained" type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? 'Criando…' : 'Criar conta'}</Button>
        </Stack>
      </Paper>
      <Paper variant="outlined" sx={{ p: 3, minWidth: 0 }}><Stack direction="row" sx={{ justifyContent: 'space-between', mb: 2 }}><Typography component="h2" variant="h5">Pessoas da equipe</Typography><Button disabled={users.isFetching} onClick={() => void refresh()}>Atualizar</Button></Stack>
        {users.isPending ? <Typography role="status">Carregando contas…</Typography> : users.isError ? <Alert severity="warning">Não foi possível consultar contas. Use Atualizar para tentar novamente.</Alert> : users.data.length === 0 ? <Typography>Nenhuma conta encontrada.</Typography> : <Stack divider={<Divider/>}>{users.data.map(user => <Stack key={user.id} direction={{ xs: 'column', sm: 'row' }} sx={{ py: 2, gap: 1, justifyContent: 'space-between', alignItems: { sm: 'center' } }}><Box sx={{ minWidth: 0 }}><Typography sx={{ fontWeight: 650, overflowWrap: 'anywhere' }}>{user.name}</Typography><Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>{user.email}</Typography><Stack direction="row" sx={{ gap: 1, mt: 1 }}><Chip size="small" label={labels[user.role]}/><Chip size="small" variant="outlined" label={user.active ? 'Ativa' : 'Desativada'}/></Stack></Box><Button onClick={() => { setSelected(user); setRole(user.role); setActive(user.active); setReason(''); setError(''); }} aria-label={'Gerenciar ' + user.name}>Gerenciar</Button></Stack>)}</Stack>}
        <Typography variant="caption" color="text.secondary">Exibição limitada às 100 contas mais recentes nesta etapa.</Typography>
      </Paper>
    </Box>
    <Paper variant="outlined" sx={{ p: 3, mt: 3 }}><Typography component="h2" variant="h5" sx={{ mb: 2 }}>Histórico de acesso e alterações</Typography>
      {audit.isPending ? <Typography role="status">Carregando histórico…</Typography> : audit.isError ? <Alert severity="warning">Não foi possível consultar o histórico. <Button onClick={() => void audit.refetch()}>Tentar novamente</Button></Alert> : audit.data.length === 0 ? <Typography>Nenhum registro encontrado.</Typography> : <Stack divider={<Divider/>}>{audit.data.map(event => <Box key={event.id} sx={{ py: 2, overflowWrap: 'anywhere' }}><Typography sx={{ fontWeight: 650 }}>{actions[event.action] ?? event.action}</Typography><Typography variant="body2">{event.reason}</Typography><Typography variant="caption" color="text.secondary">{new Date(event.createdAt).toLocaleString('pt-BR')} · Responsável: {users.data?.find(user => user.id === event.actorId)?.name ?? event.actorId ?? 'Configuração local'} · Conta: {users.data?.find(user => user.id === event.targetId)?.name ?? event.targetId}</Typography></Box>)}</Stack>}
      <Typography variant="caption" color="text.secondary">Últimos 100 registros. Senhas e tokens não fazem parte da auditoria.</Typography>
    </Paper>
    <Dialog open={!!selected} onClose={() => { if (!busy) setSelected(null); }} fullWidth maxWidth="sm" aria-labelledby="account-title"><DialogTitle id="account-title">Gerenciar {selected?.name}</DialogTitle><DialogContent><Typography sx={{ mb: 3 }}>Alterações de perfil ou situação encerram todas as sessões desta conta. A revogação encerra as sessões sem alterar o cadastro.</Typography><Stack spacing={2}>
      <TextField select label="Perfil" value={role} onChange={event => setRole(event.target.value as Role)}>{Object.entries(labels).map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}</TextField>
      <TextField select label="Situação" value={active ? 'active' : 'inactive'} onChange={event => setActive(event.target.value === 'active')}><MenuItem value="active">Ativa</MenuItem><MenuItem value="inactive">Desativada</MenuItem></TextField>
      <TextField autoFocus label="Motivo" value={reason} onChange={event => setReason(event.target.value)} helperText="De 5 a 300 caracteres. Não inclua senhas ou dados sensíveis." multiline minRows={2} slotProps={{ htmlInput: { maxLength: 300 } }}/>
      {error && <Alert severity="error">{error}</Alert>}
    </Stack></DialogContent><DialogActions sx={{ p: 3, flexWrap: 'wrap', gap: 1 }}><Button disabled={busy} onClick={() => setSelected(null)}>Cancelar</Button><Button color="warning" disabled={busy} onClick={() => void change(true)}>Revogar sessões</Button><Button variant="contained" disabled={busy} onClick={() => void change(false)}>{busy ? 'Salvando…' : 'Salvar alterações'}</Button></DialogActions></Dialog>
  </Container>;
}
