import { useGrimoireStore } from '../store/useGrimoireStore';
import { JourneyDashboard } from '../features/route/JourneyDashboard';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { SaveReminderModal } from '../components/SaveReminderModal';
import { VerificationSeal } from '../components/VerificationSeal';
import { LevelBudgetPage } from '../features/level-budget/LevelBudgetPage';
import { MythsPage } from '../features/reference/MythsPage';
import { GlossaryPage } from '../features/reference/GlossaryPage';
import { AboutPage } from '../features/reference/AboutPage';

describe('SaveReminderModal', () => {
  it('renders quest warnings and fires callbacks on proceed', () => {
    const onClose = vi.fn();
    const onConfirmProceed = vi.fn();

    render(
      <SaveReminderModal
        open={true}
        questTitle="Blood on the Ice"
        warnings={['Quest notoriamente bugada em Windhelm.']}
        onClose={onClose}
        onConfirmProceed={onConfirmProceed}
      />
    );

    expect(screen.getByText('Salve em Slot Separado Antes')).toBeInTheDocument();
    expect(screen.getByText(/Blood on the Ice/)).toBeInTheDocument();
    expect(screen.getByText('Quest notoriamente bugada em Windhelm.')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Já salvei — continuar'));
    expect(onConfirmProceed).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('VerificationSeal', () => {
  it('renders Verificar no jogo for [C] / needs_verification and hides for confirmed [A]', () => {
    const { rerender } = render(<VerificationSeal needsVerification confidenceTier="C" />);
    expect(screen.getByText(/Verificar no jogo \[C\]/)).toBeInTheDocument();

    rerender(<VerificationSeal needsVerification={false} confidenceTier="A" />);
    expect(screen.queryByText(/Verificar no jogo/)).not.toBeInTheDocument();
  });
});

describe('Reference Pages (Myths, Glossary, About, LevelBudget)', () => {
  it('filters Myths vs. Facts by category and renders Verificar no jogo seals', () => {
    render(<MythsPage />);
    expect(screen.getByText('Mitos vs. Fatos (Apêndice A)')).toBeInTheDocument();
    expect(screen.getByText('Máscara Vokun')).toBeInTheDocument();
    expect(screen.getAllByText(/Verificar no jogo/i).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: /Omitidos/ }));
    expect(screen.getByText(/Itens não confirmados do Dossiê/i)).toBeInTheDocument();
    expect(screen.queryByText('Máscara Vokun')).not.toBeInTheDocument();
  });

  it('filters Glossary terms by search query', () => {
    render(<GlossaryPage />);
    const input = screen.getByLabelText('Filtrar termos do glossário');
    fireEvent.change(input, { target: { value: 'Atronach' } });
    expect(screen.getByText('Atronach')).toBeInTheDocument();
    expect(screen.queryByText('Aggro')).not.toBeInTheDocument();
  });

  it('renders fan disclaimer and 18-file data audit counts on AboutPage', () => {
    render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>
    );
    expect(screen.getByText(/não afiliado, endossado ou patrocinado pela Bethesda Softworks/i)).toBeInTheDocument();
    expect(screen.getByText('Auditoria da Base Estruturada (/data)')).toBeInTheDocument();
    expect(screen.getByText(/18 arquivos JSON auditados/i)).toBeInTheDocument();
  });

  it('renders UESP XP metrics, Breton milestones, and Trainers on LevelBudgetPage', () => {
    render(<LevelBudgetPage />);
    expect(screen.getByText(/Marcos da Build \(Baseline Breton/i)).toBeInTheDocument();
    expect(screen.getByText(/Treinadores Úteis/i)).toBeInTheDocument();
    expect(screen.getByText('Falion')).toBeInTheDocument();
  });
});

describe('JourneyDashboard', () => {
  it('links the first unfinished objective to its exact step and location', () => {
    const initialSteps = useGrimoireStore.getState().completedGuidedSteps;
    useGrimoireStore.setState({ completedGuidedSteps: ['step_01_helgen'] });
    try {
      render(<MemoryRouter><JourneyDashboard /></MemoryRouter>);
      expect(screen.getByRole('heading', { name: 'Ativar a Mage Stone' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Retomar jornada/ })).toHaveAttribute('href', '/rota?passo=step_02_mage_stone');
      expect(screen.getByRole('link', { name: 'Localizar no mapa' })).toHaveAttribute('href', '/mapa?local=loc_guardian_stones');
      fireEvent.click(screen.getByRole('button', { name: 'Níveis 11–25' }));
      expect(screen.getByRole('button', { name: 'Níveis 11–25' })).toHaveAttribute('aria-pressed', 'true');
      expect(useGrimoireStore.getState().completedGuidedSteps).toEqual(['step_01_helgen']);
    } finally {
      useGrimoireStore.setState({ completedGuidedSteps: initialSteps });
    }
  });
});
