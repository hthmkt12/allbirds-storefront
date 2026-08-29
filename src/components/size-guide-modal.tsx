import { useDrawerA11y } from "../utils/use-drawer-a11y";

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SIZE_ROWS = [
  ["8", "7", "41", "26"],
  ["9", "8", "42", "27"],
  ["10", "9", "43", "28"],
  ["11", "10", "44", "29"],
  ["12", "11", "45", "30"],
  ["13", "12", "46", "31"],
  ["14", "13", "47", "32"],
  ["15", "14", "48", "33"],
];

export function SizeGuideModal({ isOpen, onClose }: SizeGuideModalProps) {
  const panelRef = useDrawerA11y(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div
      className="size-guide-modal-overlay"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        className="size-guide-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Size Guide"
        aria-modal="true"
      >
        <h2>Size Guide</h2>
        <table>
          <thead>
            <tr>
              <th>US</th>
              <th>UK</th>
              <th>EU</th>
              <th>CM</th>
            </tr>
          </thead>
          <tbody>
            {SIZE_ROWS.map(([us, uk, eu, cm]) => (
              <tr key={us}>
                <td>{us}</td>
                <td>{uk}</td>
                <td>{eu}</td>
                <td>{cm}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" className="pill-button close-modal" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
