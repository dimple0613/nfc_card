export class NfcDuplicateDetector {
  private detectedCardIds: Set<string> = new Set();

  hasCardBeenDetected(uid: string): boolean {
    return this.detectedCardIds.has(uid);
  }

  add(cardId: string): boolean {
    if (this.detectedCardIds.has(cardId)) {
      return false;
    }
    this.detectedCardIds.add(cardId);
    return true;
  }

  size(): number {
    return this.detectedCardIds.size;
  }

  clear(): void {
    this.detectedCardIds.clear();
  }

  getAll(): string[] {
    return Array.from(this.detectedCardIds);
  }
}
