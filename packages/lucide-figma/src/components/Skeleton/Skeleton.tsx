import './Skeleton.scss'

const Skeleton = () => {
  return (
    <>
      {Array.from({ length: 48 }, (n, index) => (
        <div className="skeleton" key={index} />
      ))}
    </>
  )
}

export default Skeleton
