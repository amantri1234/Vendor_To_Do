import { useState, useEffect, useCallback, useRef } from 'react'
import { tasksAPI } from '../services/api'
import toast from 'react-hot-toast'

export function useTasks() {
  const [tasks, setTasks]     = useState([])
  const [loading, setLoading] = useState(true)
  const abortRef              = useRef(null)

  const fetchTasks = useCallback(async () => {
    // Cancel any in-flight request before making a new one
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    try {
      const { data } = await tasksAPI.list()
      setTasks(data)
    } catch (err) {
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
        toast.error('Failed to load tasks')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
    return () => abortRef.current?.abort()
  }, [fetchTasks])

  const createTask = useCallback(async (taskData) => {
    const { data } = await tasksAPI.create(taskData)
    setTasks((prev) => [data, ...prev])
    toast.success('Task created')
    return data
  }, [])

  const updateTask = useCallback(async (id, taskData) => {
    const { data } = await tasksAPI.update(id, taskData)
    setTasks((prev) => prev.map((t) => (t.id === id ? data : t)))
    toast.success('Task updated')
    return data
  }, [])

  const deleteTask = useCallback(async (id) => {
    // Optimistic removal
    setTasks((prev) => prev.filter((t) => t.id !== id))
    try {
      await tasksAPI.delete(id)
      toast.success('Task deleted')
    } catch (err) {
      // Rollback on failure — re-fetch to restore correct state
      fetchTasks()
      throw err
    }
  }, [fetchTasks])

  const completeTask = useCallback(async (id) => {
    const { data } = await tasksAPI.complete(id)
    setTasks((prev) => prev.map((t) => (t.id === id ? data : t)))
    toast.success('Task completed ✓')
    return data
  }, [])

  const addTasksFromTemplate = useCallback((newTasks) => {
    setTasks((prev) => [...newTasks, ...prev])
  }, [])

  return {
    tasks, loading,
    createTask, updateTask, deleteTask, completeTask,
    addTasksFromTemplate, refresh: fetchTasks,
  }
}
