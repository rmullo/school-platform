import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { schoolInputSchemas, type SchoolOverview, type SchoolResource } from '@smartschool/contracts';
import { api } from '../auth/session.js';

export type Editor = { resource: SchoolResource; id?: string; version?: number; values: Record<string, string>; offer?: boolean; remove?: boolean };
const names = { years: 'ano letivo', stages: 'etapa', grades: 'série', classrooms: 'turma' };
export function SchoolForm({ editor, overview, close, saved }: { editor: Editor; overview: SchoolOverview; close(): void; saved(): Promise<void> }) {
  const form = useForm<Record<string, string>>({ defaultValues: { segment: 'INFANTIL', demonstration: 'yes', hasAuthorization: 'no', ...editor.values } });
  const [error, setError] = useState('');
  const busy = form.formState.isSubmitting;
  const field = (key: string, label: string, type = 'text', options?: { value: string; label: string }[]) => <TextField key={key} label={label} type={options ? undefined : type} select={!!options} defaultValue={form.getValues(key) ?? ''} {...form.register(key)} error={!!form.formState.errors[key]} helperText={form.formState.errors[key]?.message} fullWidth slotProps={type === 'date' ? { inputLabel: { shrink: true } } : { htmlInput: { maxLength: key === 'evidence' ? 500 : key === 'reason' ? 300 : 100 } }}>{options?.map(option => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}</TextField>;
  const title = editor.remove ? `Excluir ${names[editor.resource]}` : editor.offer === undefined ? `${editor.id ? 'Editar' : 'Cadastrar'} ${names[editor.resource]}` : editor.offer ? 'Ativar oferta da turma' : 'Desativar oferta da turma';
  return <Dialog open onClose={() => { if (!busy) close(); }} fullWidth maxWidth="sm" aria-labelledby="school-editor-title">
    <DialogTitle id="school-editor-title">{title}</DialogTitle>
    <form noValidate onSubmit={form.handleSubmit(async values => {
      setError('');
      try {
        if (editor.id && (!values.reason || values.reason.trim().length < 5 || values.reason.trim().length > 300)) { form.setError('reason', { message: 'Informe um motivo de 5 a 300 caracteres.' }, { shouldFocus: true }); return; }
        if (editor.remove) {
          await api(`school/${editor.resource}/${editor.id}`, { method: 'DELETE', body: JSON.stringify({ version: editor.version, reason: values.reason }) });
        } else if (editor.offer !== undefined) {
          await api(`school/classrooms/${editor.id}/offer`, { method: 'PATCH', body: JSON.stringify({ active: editor.offer, version: editor.version, reason: values.reason }) });
        } else {
          const input = editor.resource === 'years' ? { year: Number(values.year), startDate: values.startDate, endDate: values.endDate }
            : editor.resource === 'stages' ? { name: values.name, segment: values.segment, authorization: values.hasAuthorization === 'yes' ? { authority: values.authority, act: values.act, evidence: values.evidence, validFrom: values.validFrom, validUntil: values.validUntil, demonstration: values.demonstration === 'yes' } : null }
            : editor.resource === 'grades' ? { name: values.name, stageId: values.stageId }
            : { name: values.name, schoolYearId: values.schoolYearId, gradeId: values.gradeId, capacity: Number(values.capacity) };
          const result = schoolInputSchemas[editor.resource].safeParse(input);
          if (!result.success) {
            for (const issue of result.error.issues) { const key = String(issue.path.at(-1) ?? 'name'); form.setError(key, { message: 'Confira o campo, o formato e os limites informados.' }, { shouldFocus: true }); }
            setError('Não foi possível salvar. Confira os campos e a ordem das datas.'); return;
          }
          await api(`school/${editor.resource}${editor.id ? '/' + editor.id : ''}`, { method: editor.id ? 'PUT' : 'POST', body: JSON.stringify(editor.id ? { data: result.data, version: editor.version, reason: values.reason } : result.data) });
        }
        await saved(); close();
      } catch (failure) { setError(failure instanceof Error ? failure.message : 'Não foi possível salvar. Tente novamente.'); }
    })}>
      <DialogContent><Stack spacing={2.5} sx={{ pt: 1 }}>
        {editor.remove ? <Alert severity="warning">A exclusão é permanente. Cadastros com dependências, turma ocupada ou oferta ativa precisarão ser tratados antes.</Alert> : editor.offer !== undefined ? <Typography>{editor.offer ? 'A referência deve cobrir todo o período letivo. Ativação de demonstração não autoriza operação real.' : 'A turma permanece cadastrada, mas não será apresentada como oferta disponível.'}</Typography> : <>
          {editor.resource === 'years' ? <>{field('year', 'Ano letivo', 'number')}{field('startDate', 'Início do período letivo', 'date')}{field('endDate', 'Fim do período letivo', 'date')}</> : field('name', 'Nome')}
          {editor.resource === 'stages' && <>
            {field('segment', 'Segmento', 'text', [{ value: 'INFANTIL', label: 'Educação infantil' }, { value: 'FUNDAMENTAL', label: 'Ensino fundamental' }])}
            <TextField select label="Referência de autorização" value={form.watch('hasAuthorization')} onChange={event => form.setValue('hasAuthorization', event.target.value)}><MenuItem value="no">Cadastrar depois (rascunho)</MenuItem><MenuItem value="yes">Informar referência</MenuItem></TextField>
            {form.watch('hasAuthorization') === 'yes' && <>
              <Alert severity="info">Use referências claramente fictícias na demonstração. O cadastro não comprova autorização escolar real.</Alert>
              {field('authority', 'Órgão')}{field('act', 'Ato de autorização')}{field('evidence', 'Referência da evidência')}{field('validFrom', 'Início da validade', 'date')}{field('validUntil', 'Fim da validade', 'date')}
              {field('demonstration', 'Natureza da referência', 'text', [{ value: 'yes', label: 'Fictícia — demonstração' }, { value: 'no', label: 'Referência administrativa — não certificada' }])}
            </>}
          </>}
          {editor.resource === 'grades' && field('stageId', 'Etapa', 'text', overview.stages.map(stage => ({ value: stage.id, label: stage.name })))}
          {editor.resource === 'classrooms' && <>
            {field('schoolYearId', 'Ano letivo', 'text', overview.years.map(year => ({ value: year.id, label: String(year.year) })))}
            {field('gradeId', 'Série', 'text', overview.grades.map(grade => ({ value: grade.id, label: `${overview.stages.find(stage => stage.id === grade.stageId)?.name} · ${grade.name}` })))}
            {field('capacity', 'Capacidade máxima', 'number')}<Typography variant="caption" color="text.secondary">A capacidade deve ser positiva e nunca inferior à ocupação. Novas turmas começam em rascunho.</Typography>
          </>}
        </>}
        {editor.id && field('reason', 'Motivo da alteração')}
        {error && <Alert severity="error" role="alert">{error}</Alert>}
      </Stack></DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}><Button disabled={busy} onClick={close}>Cancelar</Button><Button type="submit" color={editor.remove ? 'error' : 'primary'} variant="contained" disabled={busy}>{busy ? 'Processando…' : editor.remove ? 'Excluir definitivamente' : editor.offer !== undefined ? 'Confirmar' : 'Salvar'}</Button></DialogActions>
    </form>
  </Dialog>;
}
