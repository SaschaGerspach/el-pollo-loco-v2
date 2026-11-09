export type LegalPage = "legal" | "privacy";

// The pages are dialogs in index.html, outside the canvas.
export function showLegalPage(page: LegalPage) {
  const dialog = document.getElementById(`${page}-page`) as HTMLDialogElement;
  dialog.showModal();
}
