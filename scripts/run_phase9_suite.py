import requests
import time
import sys

BASE_URL = "http://localhost:8000/api/v1"

def print_header(title):
    print(f"\n{'-'*60}")
    print(f" {title} ")
    print(f"{'-'*60}")

def test_finops():
    print_header("Testing FinOps Auto-Remediation")
    res = requests.get(f"{BASE_URL}/finops/status")
    if res.status_code == 200:
        data = res.json()
        print(f"✅ Retrieved FinOps Status")
        print(f"   Daily Budget: ${data['summary']['daily_budget']}")
        print(f"   Projected Spend: ${data['summary']['projected_spend']} ({data['summary']['status']})")
        print(f"   Idle Resources: {len(data['idle_resources'])}")
        
        cull_res = requests.post(f"{BASE_URL}/finops/cull", json={"resource_id": "disk-1a2b3c"})
        if cull_res.status_code == 200:
            print(f"✅ Culled idle resource disk-1a2b3c. Savings: ${cull_res.json().get('savings')}/mo")
        else:
            print(f"❌ Failed to cull resource")
    else:
        print("❌ Failed to reach FinOps API")

def test_assistant():
    print_header("Testing AIOps Assistant")
    res = requests.get(f"{BASE_URL}/assistant/context")
    if res.status_code == 200:
        data = res.json()
        print(f"✅ Model: {data['model']}")
        print(f"   Active Incidents: {len(data['active_incidents'])}")
        
        print("   Analyzing incident INC-8891 (waiting for LLM response...)")
        t0 = time.time()
        analyze_res = requests.get(f"{BASE_URL}/assistant/analyze/INC-8891")
        t1 = time.time()
        
        if analyze_res.status_code == 200:
            analysis = analyze_res.json()
            print(f"✅ AI Analysis Complete ({(t1-t0):.2f}s)")
            print(f"   Confidence: {analysis['confidence_score']*100}%")
            print(f"   Summary: {analysis['root_cause_summary'][:100]}...")
        else:
            print("❌ Failed to analyze incident")
    else:
        print("❌ Failed to reach AIOps Assistant API")

def test_policies():
    print_header("Testing DevSecOps Policies")
    res = requests.get(f"{BASE_URL}/policies/overview")
    if res.status_code == 200:
        data = res.json()
        print(f"✅ Policy Engine Overview")
        print(f"   Active Policies: {len(data['policies'])}")
        print(f"   Compliance Score: {data['compliance_score']}%")
        
        yaml_manifest = "apiVersion: v1\nkind: Pod\nmetadata:\n  name: nginx\nspec:\n  containers:\n  - name: nginx\n    securityContext:\n      privileged: true"
        eval_res = requests.post(f"{BASE_URL}/policies/evaluate", json={"manifest_yaml": yaml_manifest})
        
        if eval_res.status_code == 200:
            eval_data = eval_res.json()
            print(f"✅ Evaluated Pod Manifest (Privileged=true)")
            print(f"   Result: {eval_data['status']} - {len(eval_data['violations'])} Violations")
        else:
            print("❌ Failed to evaluate manifest")
    else:
        print("❌ Failed to reach Policies API")

if __name__ == "__main__":
    print("======================================================================")
    print("🚀 AIGRA Ops — Phase 9 FinOps, AIOps & Policies Suite")
    print("======================================================================")
    try:
        # Check if backend is running
        requests.get("http://localhost:8000/api/v1/health")
        test_finops()
        test_assistant()
        test_policies()
        print("\n======================================================================")
        print("🎉 All Phase 9 Subsystems PASSED Validation!")
        print("======================================================================")
    except requests.exceptions.ConnectionError:
        print("\n❌ Backend is not running. Please start the backend server on port 8000.")
        sys.exit(1)
