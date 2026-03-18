import { useState } from 'react'
import type { Engine, ProductStage } from '@/types'
import { ENGINE_META } from '@/types'
import type { Action } from '@/hooks/useAppState'
import { Welcome } from './steps/Welcome'
import { ProductName } from './steps/ProductName'
import { StageSelect } from './steps/StageSelect'
import { EngineSelect } from './steps/EngineSelect'
import { MissionBriefing } from './steps/MissionBriefing'

interface Props {
  dispatch: React.Dispatch<Action>
  onComplete: () => void
}

export function FirstMission({ dispatch, onComplete }: Props) {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [stage, setStage] = useState<ProductStage>('early')
  const [primaryEngine, setPrimaryEngine] = useState<Engine>('pull')
  const [secondaryEngines, setSecondaryEngines] = useState<Engine[]>(['push'])

  function toggleSecondary(engine: Engine) {
    setSecondaryEngines(prev =>
      prev.includes(engine) ? prev.filter(e => e !== engine) : [...prev, engine]
    )
  }

  function handleLaunch() {
    dispatch({
      type: 'ADD_PRODUCT',
      payload: {
        name: name.trim(),
        description: description.trim(),
        stage,
        primaryEngine,
        secondaryEngines: secondaryEngines.filter(e => e !== primaryEngine),
        color: ENGINE_META[primaryEngine].color,
      },
    })
    onComplete()
  }

  // Progress bar
  const progress = ((step - 1) / 4) * 100

  return (
    <div>
      {/* Progress indicator */}
      {step > 1 && (
        <div className="h-1 bg-[var(--color-progress-track)] rounded-full mb-2 overflow-hidden">
          <div
            className="h-full bg-[var(--color-accent)] transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {step === 1 && <Welcome onNext={() => setStep(2)} />}
      {step === 2 && (
        <ProductName
          name={name}
          description={description}
          onNameChange={setName}
          onDescriptionChange={setDescription}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <StageSelect
          stage={stage}
          onStageChange={setStage}
          onNext={() => setStep(4)}
          onBack={() => setStep(2)}
        />
      )}
      {step === 4 && (
        <EngineSelect
          primaryEngine={primaryEngine}
          secondaryEngines={secondaryEngines}
          onPrimaryChange={setPrimaryEngine}
          onSecondaryToggle={toggleSecondary}
          onNext={() => setStep(5)}
          onBack={() => setStep(3)}
        />
      )}
      {step === 5 && (
        <MissionBriefing
          name={name}
          stage={stage}
          primaryEngine={primaryEngine}
          secondaryEngines={secondaryEngines.filter(e => e !== primaryEngine)}
          onLaunch={handleLaunch}
          onBack={() => setStep(4)}
        />
      )}
    </div>
  )
}
