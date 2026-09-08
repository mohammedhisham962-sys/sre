from fastapi import APIRouter
from ..services.ebpf_service import EbpfService

router = APIRouter()

@router.get("/metrics")
def get_ebpf_kernel_metrics():
    """
    Returns kernel-level network socket telemetry, TCP retransmits, and system call profiling.
    """
    return EbpfService.get_metrics()

@router.get("/probes")
def list_ebpf_probes():
    """
    Returns all active eBPF programs and tracepoints loaded in the Linux kernel ring.
    """
    return EbpfService.get_programs()
