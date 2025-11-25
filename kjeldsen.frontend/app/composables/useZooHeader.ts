export const useZooHeader = () => {
  const hasSplash = useState<boolean>('zoo-header-has-splash', () => true)

  const setHasSplash = (value: boolean) => {
    hasSplash.value = value
  }

  return {
    hasSplash,
    setHasSplash,
  }
}
