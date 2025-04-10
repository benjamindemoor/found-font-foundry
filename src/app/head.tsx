export default function Head() {
  return (
    <>
      <title>Found Fonts Foundry</title>
      <meta content="width=device-width, initial-scale=1" name="viewport" />
      <meta name="description" content="A growing collection of fonts discovered on the street, in the wild and everywhere in between." />
      <link rel="icon" href="/favicon.ico" />
      
      {/* Preload font files */}
      <link rel="preload" href="/fonts/Cooper Black Regular.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
      <link rel="preload" href="/fonts/Boecklins Universe.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
      <link rel="preload" href="/fonts/Brush Script.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
      <link rel="preload" href="/fonts/Davida Bold BT.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
      <link rel="preload" href="/fonts/Comic Sans MS Bold.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
      <link rel="preload" href="/fonts/choc.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
      <link rel="preload" href="/fonts/AlteHaasGroteskRegular.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
    </>
  )
} 