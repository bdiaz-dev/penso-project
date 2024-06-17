export default function ProviderError () {
  return (
    <div className='h-screen flex flex-col justify-center items-center align-middle'>
      <h1 className=''>
        {'You use this email with another OAuth service'}
      </h1>
      <p>
        Please, use the correct one.
      </p>
    </div>
  )
}
