import { ShareStrip } from './share-strip'

export default function ShareStripDemo() {
  return (
    <ShareStrip
      title="Language distribution"
      parts={[
        { label: 'Typescript', value: 35 },
        { label: 'Go', value: 34 },
        { label: 'Python', value: 34 },
        { label: 'Javascript', value: 5 },
        { label: 'Rust', value: 5 },
      ]}
    />
  )
}
