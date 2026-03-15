import { useState, useEffect, useCallback, useRef } from 'react'
import { templatesAPI } from '../services/api'
import toast from 'react-hot-toast'

export function useTemplates() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading]     = useState(true)
  const abortRef                  = useRef(null)

  const fetchTemplates = useCallback(async () => {
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    try {
      const { data } = await templatesAPI.list()
      setTemplates(data)
    } catch (err) {
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
        toast.error('Failed to load templates')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTemplates()
    return () => abortRef.current?.abort()
  }, [fetchTemplates])

  const createTemplate = useCallback(async (templateData) => {
    const { data } = await templatesAPI.create(templateData)
    setTemplates((prev) => [data, ...prev])
    toast.success('Template created')
    return data
  }, [])

  const deleteTemplate = useCallback(async (id) => {
    // Optimistic removal
    setTemplates((prev) => prev.filter((t) => t.id !== id))
    try {
      await templatesAPI.delete(id)
      toast.success('Template deleted')
    } catch (err) {
      fetchTemplates()   // rollback on failure
      throw err
    }
  }, [fetchTemplates])

  const applyTemplate = useCallback(async (id) => {
    const { data } = await templatesAPI.applyTasks(id)
    toast.success(`${data.length} task${data.length !== 1 ? 's' : ''} created from template`)
    return data
  }, [])

  return { templates, loading, createTemplate, deleteTemplate, applyTemplate }
}
