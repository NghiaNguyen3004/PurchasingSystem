import {
  getMyRequests,
  submitRequest,
  getPendingRequests,
  approveRequest,
  rejectRequest,
  getApprovedRequests,
  setProcessing,
  completeRequest,
} from "../services/api.js"

export function useRequest(token) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading]   = useState(true)

  const fetchRequests = async (fetcher) => {
    setLoading(true)
    try {
      const data = await fetcher(token)
      setRequests(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }

  // Requester
  const fetchMyRequests    = () => fetchRequests(getMyRequests)
  const submitNewRequest   = async (form) => { await submitRequest(token, form); fetchMyRequests() }

  // Approver
  const fetchPending       = () => fetchRequests(getPendingRequests)
  const approve            = async (id) => { await approveRequest(token, id); fetchPending() }
  const reject             = async (id) => { await rejectRequest(token, id); fetchPending() }

  // Procure Manager
  const fetchApproved      = () => fetchRequests(getApprovedRequests)
  const setProcessingStatus = async (id) => { await setProcessing(token, id); fetchApproved() }
  const complete           = async (id) => { await completeRequest(token, id); fetchApproved() }

  return {
    requests, loading,
    fetchMyRequests, submitNewRequest,
    fetchPending, approve, reject,
    fetchApproved, setProcessingStatus, complete,
  }
}