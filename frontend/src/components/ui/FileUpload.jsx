import { useCallback, useState } from 'react'
import { Upload, File, X, AlertCircle } from 'lucide-react'
import { cn, formatFileSize } from '../../lib/utils'
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE_MB } from '../../lib/constants'

export default function FileUpload({ onFilesSelected, accept, multiple = true, className }) {
  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState([])
  const [error, setError] = useState(null)

  const acceptedTypes = accept || [
    ...ACCEPTED_FILE_TYPES.images,
    ...ACCEPTED_FILE_TYPES.documents,
  ]

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const validateFiles = (fileList) => {
    const validated = []
    for (const file of fileList) {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setError(`${file.name} exceeds ${MAX_FILE_SIZE_MB}MB limit`)
        continue
      }
      if (acceptedTypes.length && !acceptedTypes.includes(file.type)) {
        setError(`${file.name} is not a supported file type`)
        continue
      }
      validated.push(file)
    }
    return validated
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    setError(null)

    const droppedFiles = validateFiles(Array.from(e.dataTransfer.files))
    if (droppedFiles.length) {
      const newFiles = multiple ? [...files, ...droppedFiles] : [droppedFiles[0]]
      setFiles(newFiles)
      onFilesSelected?.(newFiles)
    }
  }, [files, multiple, onFilesSelected])

  const handleChange = (e) => {
    setError(null)
    const selectedFiles = validateFiles(Array.from(e.target.files))
    if (selectedFiles.length) {
      const newFiles = multiple ? [...files, ...selectedFiles] : [selectedFiles[0]]
      setFiles(newFiles)
      onFilesSelected?.(newFiles)
    }
  }

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles)
    onFilesSelected?.(newFiles)
  }

  return (
    <div className={className}>
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          'relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 transition-all cursor-pointer',
          dragActive
            ? 'border-primary-400 bg-primary-50'
            : 'border-neutral-200 hover:border-primary-300 bg-neutral-50 hover:bg-primary-50/50'
        )}
      >
        <input
          type="file"
          accept={acceptedTypes.join(',')}
          multiple={multiple}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className={cn(
          'flex items-center justify-center w-14 h-14 rounded-2xl mb-4',
          dragActive ? 'bg-primary-100' : 'bg-primary-50'
        )}>
          <Upload className={cn('h-7 w-7', dragActive ? 'text-primary-600' : 'text-primary-400')} />
        </div>
        <p className="text-sm text-neutral-700 font-semibold">
          Drop files here or click to upload
        </p>
        <p className="text-xs text-neutral-400 mt-1.5">
          PDF, JPG, PNG up to {MAX_FILE_SIZE_MB}MB
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 mt-3 text-sm text-red-500 font-medium">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((file, i) => (
            <div
              key={`${file.name}-${i}`}
              className="flex items-center justify-between bg-neutral-50 rounded-xl px-4 py-3 border border-neutral-200"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-100">
                  <File className="h-4 w-4 text-primary-500" />
                </div>
                <span className="text-sm text-neutral-700 font-medium truncate">{file.name}</span>
                <span className="text-xs text-neutral-400 flex-shrink-0">{formatFileSize(file.size)}</span>
              </div>
              <button
                onClick={() => removeFile(i)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
