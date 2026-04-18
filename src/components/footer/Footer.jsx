export default function Footer() {
  return (
    <footer className="p-8 text-center flex flex-col justify-center gap-4 ">
      <div className="flex justify-center gap-4">
        <p>Give us your feedback!</p>
        <p className="underline hover:text-gray-700 transition-all">
          <a href="mailto:PSlate.feedback@gmail.com">PSlate.feedback@gmail.com</a>
        </p>
      </div>
      <div>© Nahlah Almutawa. All rights reserved.</div>
    </footer>
  )
}
