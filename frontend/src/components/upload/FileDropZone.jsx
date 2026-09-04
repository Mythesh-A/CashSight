/**
 * FileDropZone - Reusable file drop zone component
 */
import React from 'react'
import { uploadStyles } from './styles'

export default function FileDropZone({
  type,
  label,
  icon,
  description,
  file,
  fileData,
  isDragging,
  onDrop,
  onRemove,
  onSelect,
  requiredColumns = []
}) {
  return (
    <div
      style={uploadStyles.dropZone(isDragging, !!file)}
      onDragOver={(e) => {
        e.preventDefault()
        onDrop(type, e, 'dragOver')
      }}
      onDragLeave={(e) => {
        e.preventDefault()
        onDrop(type, e, 'dragLeave')
      }}
      onDrop={(e) => {
        e.preventDefault()
        onDrop(type, e, 'drop')
      }}
      onClick={() => document.getElementById(`file-${type}`).click()}
    >
      <input
        id={`file-${type}`}
        type="file"
        accept=".csv"
        style={{ display: 'none' }}
        onChange={(e) => onSelect(type, e)}
      />
      
      {file ? (
        <>
          <div style={{ fontSize: '32px' }}>✅</div>
          <div style={uploadStyles.fileInfo}>{file.name}</div>
          <div style={uploadStyles.fileSize}>
            {(file.size / 1024).toFixed(1)} KB • {fileData?.totalRows || 0} rows
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove(type)
            }}
            style={uploadStyles.removeButton}
          >
            ✕
          </button>
        </>
      ) : (
        <>
          <div style={uploadStyles.dropZoneIcon}>{icon}</div>
          <div style={uploadStyles.dropZoneLabel}>{label}</div>
          <div style={uploadStyles.dropZoneDescription}>{description}</div>
          <div style={uploadStyles.dropZoneBadge}>CSV required</div>
          {requiredColumns.length > 0 && (
            <div style={{ fontSize: '10px', color: '#bbb', marginTop: '4px' }}>
              Required: {requiredColumns.join(', ')}
            </div>
          )}
        </>
      )}
    </div>
  )
}