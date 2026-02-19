class AudioManager {
  private ctx: AudioContext | null = null
  private sfxVolume = 0.5

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      try {
        this.ctx = new AudioContext()
      } catch {
        return null
      }
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {})
    }
    return this.ctx
  }

  setVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume))
  }

  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    gain = 0.3
  ): void {
    const ctx = this.getContext()
    if (!ctx) return

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)

    gainNode.gain.setValueAtTime(gain * this.sfxVolume, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + duration)
  }

  /** ぷよ落下（接地）音 */
  playDrop(): void {
    this.playTone(200, 0.1, 'square', 0.2)
  }

  /** ぷよ消去音（連鎖数に応じて音程変化） */
  playPop(chain: number): void {
    const freq = 440 + (chain - 1) * 110
    this.playTone(freq, 0.2, 'sine', 0.4)
    setTimeout(() => this.playTone(freq * 1.25, 0.15, 'sine', 0.3), 100)
  }

  /** 連鎖音 */
  playChain(chain: number): void {
    const baseFreq = 330 + (chain - 1) * 80
    for (let i = 0; i < chain; i++) {
      setTimeout(() => {
        this.playTone(baseFreq + i * 60, 0.15, 'triangle', 0.35)
      }, i * 80)
    }
  }

  /** 移動音 */
  playMove(): void {
    this.playTone(300, 0.05, 'square', 0.1)
  }

  /** ゲームオーバー音 */
  playGameOver(): void {
    const freqs = [440, 370, 330, 220]
    freqs.forEach((f, i) => {
      setTimeout(() => this.playTone(f, 0.3, 'sawtooth', 0.3), i * 150)
    })
  }
}

export const audioManager = new AudioManager()
