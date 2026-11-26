import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Check, Compass, Layers, MapPin, ScrollText } from 'lucide-react';
import { guidedSteps, phases, quests } from '../../lib/data';
import { useGrimoireStore } from '../../store/useGrimoireStore';
import type { PhaseId } from '../../types/grimoire';

export function JourneyDashboard() {
  const completed = useGrimoireStore((state) => state.completedGuidedSteps);
  const completedQuests = useGrimoireStore((state) => state.completedQuests);
  const level = useGrimoireStore((state) => state.characterLevel);
  const next = guidedSteps.find((step) => !completed.includes(step.id));
  const [viewedPhase, setViewedPhase] = useState<PhaseId | null>(null);
  const phase = phases.find((entry) => entry.id === (viewedPhase ?? next?.fase)) ?? phases[0];
  const phaseSteps = guidedSteps.filter((step) => step.fase === phase.id);
  const phaseDone = phaseSteps.filter((step) => completed.includes(step.id)).length;
  const totalDone = guidedSteps.filter((step) => completed.includes(step.id)).length;
  const title = (value: string) => value.replace(/^Passo \d+:\s*/, '');

  return (
    <div className="journey-dashboard">
      <section className="journey-hero" aria-labelledby="journey-title">
        <div className="journey-hero-content">
          <p className="journey-kicker"><Compass size={17} aria-hidden="true" /> Skyrim Anniversary Edition</p>
          <h1 id="journey-title">Grimório do<br />Necromante Furtivo</h1>
          <p>Da fuga de Helgen ao domínio da necromancia. Siga a rota da build, encontre seus tomos e acompanhe cada marco da sua jornada.</p>
          <div className="journey-actions">
            <Link className="journey-primary" to={next ? `/rota?passo=${next.id}` : '/rota'}>
              <Compass size={18} aria-hidden="true" /> {totalDone === 0 ? 'Começar em Helgen' : next ? 'Retomar jornada' : 'Rever rota'}
            </Link>
            <Link to="/mapa"><MapPin size={18} aria-hidden="true" /> Mapa interativo</Link>
          </div>
        </div>
      </section>
      <div className="journey-stats">
        <Link to="/niveis"><Layers aria-hidden="true" /><span>Nível registrado<strong>{level}</strong></span></Link>
        <Link to="/rota"><Compass aria-hidden="true" /><span>Etapas concluídas<strong>{totalDone} / {guidedSteps.length}</strong></span></Link>
        <Link to="/quests"><ScrollText aria-hidden="true" /><span>Missões concluídas<strong>{quests.filter((quest) => completedQuests.includes(quest.id)).length} / {quests.length}</strong></span></Link>
      </div>
      <div className="journey-columns">
        <section className="journey-panel">
          <p className="journey-kicker">{next ? 'Próximo objetivo' : 'Jornada concluída'}</p>
          {next ? <>
            <h2>{title(next.titulo)}</h2>
            <p className="journey-place"><MapPin size={16} aria-hidden="true" /> {next.onde_ir.replaceAll('->', ' → ')}</p>
            {next.com_quem_falar && <p><strong>Com quem falar</strong><br />{next.com_quem_falar}</p>}
            <ol>{next.o_que_fazer.map((action) => <li key={action}>{action}</li>)}</ol>
            {next.salvar_antes && <p className="journey-warning">Faça um salvamento manual em outro slot antes de avançar.</p>}
            <Link className="journey-primary" to={`/rota?passo=${next.id}`}>Ver etapa e marcar progresso</Link>
            {next.location_id && <Link className="journey-text-link" to={`/mapa?local=${next.location_id}`}>Localizar no mapa</Link>}
          </> : <><h2>Todas as etapas concluídas</h2><p>Consulte os marcos e os checklists na rota.</p><Link className="journey-primary" to="/rota">Abrir rota</Link></>}
        </section>
        <section className="journey-panel">
          <p className="journey-kicker">Rota da build</p>
          <h2>Fases da jornada</h2>
          <div className="journey-phase-buttons" role="group" aria-label="Selecionar fase">
            {phases.map((entry) => <button key={entry.id} type="button" aria-pressed={phase.id === entry.id} onClick={() => setViewedPhase(entry.id)}>{entry.faixa_de_nivel}</button>)}
          </div>
          <div className="journey-progress-label"><strong>{phase.nome}</strong><span>{phaseDone} de {phaseSteps.length} etapas</span></div>
          <progress aria-label={`Progresso de ${phase.nome}`} max={phaseSteps.length} value={phaseDone} />
          <ul className="journey-steps">
            {phaseSteps.map((step) => <li key={step.id}>
              <Link to={`/rota?passo=${step.id}`} aria-current={step.id === next?.id ? 'step' : undefined}>
                {completed.includes(step.id) ? <Check size={16} aria-label="Concluída" /> : <span className="journey-step-dot" aria-hidden="true" />}
                {title(step.titulo)}
              </Link>
            </li>)}
          </ul>
        </section>
      </div>
      <div className="journey-shortcuts" aria-label="Ferramentas da build">
        <Link to="/niveis"><Layers aria-hidden="true" /><span><strong>Plano de nível</strong>Atributos e prioridades por nível</span></Link>
        <Link to="/grimorio"><BookOpen aria-hidden="true" /><span><strong>Grimório</strong>Tomos, requisitos e locais</span></Link>
        <Link to="/exercito"><Compass aria-hidden="true" /><span><strong>Exército e Magicka</strong>Planeje suas invocações</span></Link>
      </div>
    </div>
  );
}
