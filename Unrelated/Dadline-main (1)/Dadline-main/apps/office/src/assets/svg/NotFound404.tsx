const NotFound404 = ({
  height = 100,
  width = 100,
}: {
  height?: number
  width?: number
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlSpace="preserve"
      x={0}
      y={0}
      viewBox="0 0 500 500"
      width={width}
      height={height}
    >
      <path
        d="M 40 280 L 120 140 V 280 H 150 V 320 H 120 V 380 H 80 V 320 H 40 Z M 80 280 V 210 L 50 280 Z"
        className="fill-[#bababa] dark:fill-gray-700"
        opacity={0.3}
      />
      <path
        d="M 250 140 C 190 140, 170 190, 170 260 C 170 330, 190 380, 250 380 C 310 380, 330 330, 330 260 C 330 190, 310 140, 250 140 Z M 250 180 C 285 180, 290 215, 290 260 C 290 305, 285 340, 250 340 C 215 340, 210 305, 210 260 C 210 215, 215 180, 250 180 Z"
        className="fill-[#bababa] dark:fill-gray-700"
        opacity={0.3}
      />
      <path
        d="M 350 280 L 430 140 V 280 H 460 V 320 H 430 V 380 H 390 V 320 H 350 Z M 390 280 V 210 L 360 280 Z"
        className="fill-[#bababa] dark:fill-gray-700"
        opacity={0.3}
      />
      <path d="M 140 450 H 360 V 475 H 140 Z" className="fill-[#393f4f]" />
      <path
        d="M 165 425 H 335 V 450 H 165 Z"
        className="fill-gray-900 dark:fill-gray-100"
      />
      <path d="M 190 400 H 310 V 425 H 190 Z" style={{ fill: "#8c8c8c" }} />
      <path
        d="M 235 150 H 265 V 400 H 235 Z"
        className="fill-gray-900 dark:fill-gray-100"
      />

      <path d="M 220 130 H 280 L 290 150 H 210 Z" className="fill-primary" />
      <path d="M 220 380 H 280 L 290 400 H 210 Z" className="fill-primary" />

      <path
        d="M 250 90 C 160 90, 90 115, 60 140 L 60 155 C 90 130, 160 105, 250 105 C 340 105, 410 130, 440 155 L 440 140 C 410 115, 340 90, 250 90 Z"
        style={{ fill: "#8c8c8c" }}
      />

      <ellipse cx={250} cy={115} rx={20} ry={20} className="fill-[#393f4f]" />
      <ellipse cx={250} cy={115} rx={10} ry={10} className="fill-primary" />

      <path
        d="M 70 145 L 30 320 H 33 L 70 148 L 107 320 H 110 L 70 145 M 70 145 V 320 H 68 V 145 Z"
        className="fill-[#bababa]"
      />
      <path
        d="M 10 320 C 10 360, 130 360, 130 320 Z"
        className="fill-[#393f4f]"
      />
      <path
        d="M 25 320 C 35 340, 105 340, 115 320 Z"
        style={{ fill: "#8c8c8c" }}
      />

      <path
        d="M 430 145 L 390 320 H 393 L 430 148 L 467 320 H 470 L 430 145 M 430 145 V 320 H 428 V 145 Z"
        className="fill-[#bababa]"
      />
      <path
        d="M 370 320 C 370 360, 490 360, 490 320 Z"
        className="fill-[#393f4f]"
      />
      <path
        d="M 385 320 C 395 340, 465 340, 475 320 Z"
        style={{ fill: "#8c8c8c" }}
      />

      <ellipse
        cx={250}
        cy={485}
        rx={180}
        ry={8}
        className="fill-gray-900 dark:fill-gray-100"
        opacity={0.15}
      />
    </svg>
  )
}

export default NotFound404
