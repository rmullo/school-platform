# MD-14 — Consulta gerencial

**Situação:** implementada e em validação; [TASK-0017](../../tasks/TASK-0017-md14-consulta-gerencial.md).

O endpoint gerencial consulta diretamente o PostgreSQL e soma recebimentos publicados/revertidos, obrigações abertas/liquidadas, créditos disponíveis, vencidos e restituições. O filtro por período/contrato é validado no servidor e o acesso é restrito à Direção; cada consulta gera auditoria.

A tela apresenta os totais principais. Exportação, exposição pública, dados reais e nota fiscal continuam fora do MVP.
