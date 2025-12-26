"use client"

import { useCallback, useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

export interface GalleryImage {
	src: string
	alt?: string
}

interface ImageGalleryProps {
	images: GalleryImage[]
}

export function ImageGallery({ images }: ImageGalleryProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [currentIndex, setCurrentIndex] = useState(0)

	const openAt = (index: number) => {
		setCurrentIndex(index)
		setIsOpen(true)
	}

	const close = useCallback(() => {
		setIsOpen(false)
	}, [])

	const showPrev = useCallback(() => {
		setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
	}, [images.length])

	const showNext = useCallback(() => {
		setCurrentIndex((prev) => (prev + 1) % images.length)
	}, [images.length])

	useEffect(() => {
		if (!isOpen) return

		const handleKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				close()
			} else if (event.key === "ArrowLeft") {
				showPrev()
			} else if (event.key === "ArrowRight") {
				showNext()
			}
		}

		window.addEventListener("keydown", handleKey)
		return () => window.removeEventListener("keydown", handleKey)
	}, [isOpen, close, showPrev, showNext])

	if (!images || images.length === 0) {
		return null
	}

	return (
		<>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{images.map((image, index) => (
					<button
						key={image.src + index}
						type="button"
						onClick={() => openAt(index)}
						className="group flex flex-col overflow-hidden rounded-xl border border-foreground/10 bg-background text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
					>
						<div className="relative aspect-[4/3] overflow-hidden bg-foreground/5">
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src={image.src}
								alt={image.alt || `Screenshot ${index + 1}`}
								className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
							/>
						</div>
						{image.alt && (
							<div className="px-3 py-2 text-xs text-foreground/70 line-clamp-1">{image.alt}</div>
						)}
					</button>
				))}
			</div>

			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4" onClick={close}>
					<div
						className="relative flex max-h-[90vh] w-full max-w-5xl items-center justify-center"
						onClick={(e) => e.stopPropagation()}
					>
						<button
							type="button"
							onClick={close}
							className="absolute right-2 top-2 rounded-full bg-black/60 p-2 text-white hover:bg-black"
							aria-label="Close"
						>
							<X className="h-5 w-5" />
						</button>

						{images.length > 1 && (
							<>
								<button
									type="button"
									onClick={showPrev}
									className="absolute left-0 hidden translate-x-[-50%] rounded-full bg-black/60 p-2 text-white transition hover:bg-black sm:inline-flex"
									aria-label="Previous"
								>
									<ChevronLeft className="h-6 w-6" />
								</button>
								<button
									type="button"
									onClick={showNext}
									className="absolute right-0 hidden translate-x-[50%] rounded-full bg-black/60 p-2 text-white transition hover:bg-black sm:inline-flex"
									aria-label="Next"
								>
									<ChevronRight className="h-6 w-6" />
								</button>
							</>
						)}

						<div className="flex max-h-[90vh] w-full items-center justify-center">
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src={images[currentIndex]?.src}
								alt={images[currentIndex]?.alt || `Screenshot ${currentIndex + 1}`}
								className="max-h-[80vh] w-auto max-w-full rounded-lg object-contain shadow-2xl"
							/>
						</div>
					</div>

					{images.length > 1 && (
						<div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
							{currentIndex + 1} / {images.length}
						</div>
					)}
				</div>
			)}
		</>
	)
}
