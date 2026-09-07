import type { DiagramId } from '@/content'
import { ConvergeDiagram } from './ConvergeDiagram'
import { SplitDiagram } from './SplitDiagram'
import { ExtractDiagram } from './ExtractDiagram'

/**
 * Dispatches to the geometry-backed SVG for a case study. `progress`
 * defaults to 1 (fully built): the static, reduced-motion state this site
 * ships today. A later stage scrubs `progress` to animate the same markup.
 */
export function Diagram({ id, progress = 1, className }: { id: DiagramId; progress?: number; className?: string }) {
  switch (id) {
    case 'converge':
      return <ConvergeDiagram progress={progress} className={className} />
    case 'split':
      return <SplitDiagram progress={progress} className={className} />
    case 'extract':
      return <ExtractDiagram progress={progress} className={className} />
  }
}
