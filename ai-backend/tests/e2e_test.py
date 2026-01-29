"""
End-to-End System Test

Run this script to verify the entire system works together.
Usage: python tests/e2e_test.py
"""

import requests
import json
import os
import sys

BASE_URL = "http://localhost:8000"


def print_result(name: str, passed: bool, details: str = ""):
    """Print test result."""
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status}: {name}")
    if details and not passed:
        print(f"       {details}")


def test_health():
    """Test health endpoint."""
    try:
        response = requests.get(f"{BASE_URL}/health")
        return response.status_code == 200
    except Exception as e:
        return False


def test_agent_status():
    """Test smart agent root."""
    try:
        response = requests.get(f"{BASE_URL}/api/v1/agent/")
        data = response.json()
        return response.status_code == 200 and data.get("status") == "ready"
    except Exception as e:
        return False


def test_memory_status():
    """Test memory status."""
    try:
        response = requests.get(f"{BASE_URL}/api/v1/agent/memory/status")
        data = response.json()
        return response.status_code == 200 and "documents" in data
    except Exception as e:
        return False


def test_upload_document():
    """Test document upload."""
    try:
        # Create a test document
        content = b"""
        Binary Search Algorithm
        
        Binary search is an efficient algorithm for finding an item in a sorted list.
        It works by repeatedly dividing the search interval in half.
        
        Time Complexity: O(log n)
        Space Complexity: O(1) iterative, O(log n) recursive
        
        Steps:
        1. Compare target with middle element
        2. If target matches, return position
        3. If target is smaller, search left half
        4. If target is larger, search right half
        5. Repeat until found or interval is empty
        """

        files = {"file": ("algorithms.txt", content, "text/plain")}
        response = requests.post(
            f"{BASE_URL}/api/v1/agent/upload", files=files)
        data = response.json()
        return response.status_code == 200 and data.get("status") == "success"
    except Exception as e:
        print(f"Upload error: {e}")
        return False


def test_classify_theory():
    """Test intent classification for theory."""
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/agent/classify",
            json={"query": "Explain binary search with slides"}
        )
        data = response.json()
        intent = data.get("intent", {})
        return response.status_code == 200 and intent.get("type") == "theory"
    except Exception as e:
        return False


def test_classify_lab():
    """Test intent classification for lab."""
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/agent/classify",
            json={"query": "Write Python code for sorting algorithm"}
        )
        data = response.json()
        intent = data.get("intent", {})
        return response.status_code == 200 and intent.get("type") == "lab"
    except Exception as e:
        return False


def test_smart_ask_theory():
    """Test smart ask for theory content."""
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/agent/ask",
            json={"query": "Explain binary search algorithm with notes"},
            timeout=60
        )
        data = response.json()
        return (
            response.status_code == 200 and
            data.get("response", {}).get("type") == "theory" and
            "content" in data.get("response", {})
        )
    except Exception as e:
        print(f"Theory ask error: {e}")
        return False


def test_smart_ask_lab():
    """Test smart ask for lab content."""
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/agent/ask",
            json={"query": "Write a Python function for binary search"},
            timeout=60
        )
        data = response.json()
        return (
            response.status_code == 200 and
            data.get("response", {}).get("type") == "lab" and
            "content" in data.get("response", {})
        )
    except Exception as e:
        print(f"Lab ask error: {e}")
        return False


def test_smart_ask_chat():
    """Test smart ask for chat."""
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/agent/ask",
            json={"query": "What is the time complexity of binary search?"},
            timeout=60
        )
        data = response.json()
        return response.status_code == 200 and "response" in data
    except Exception as e:
        print(f"Chat ask error: {e}")
        return False


def test_clear_memory():
    """Test clearing memory."""
    try:
        response = requests.delete(f"{BASE_URL}/api/v1/agent/memory/clear")
        data = response.json()
        return response.status_code == 200 and data.get("status") == "success"
    except Exception as e:
        return False


def main():
    """Run all end-to-end tests."""
    print("\n" + "=" * 60)
    print("🧪 End-to-End System Tests")
    print("=" * 60 + "\n")

    # Check if server is running
    print("Checking if server is running at", BASE_URL)
    if not test_health():
        print("\n❌ Server is not running!")
        print(f"   Start the server with: python -m uvicorn app.main:app --reload")
        sys.exit(1)

    print("✅ Server is running\n")
    print("-" * 60)

    # Run tests
    tests = [
        ("Agent Status", test_agent_status),
        ("Memory Status", test_memory_status),
        ("Upload Document", test_upload_document),
        ("Classify Theory Request", test_classify_theory),
        ("Classify Lab Request", test_classify_lab),
        ("Smart Ask - Theory", test_smart_ask_theory),
        ("Smart Ask - Lab", test_smart_ask_lab),
        ("Smart Ask - Chat", test_smart_ask_chat),
        ("Clear Memory", test_clear_memory),
    ]

    passed = 0
    failed = 0

    for name, test_func in tests:
        try:
            if test_func():
                print_result(name, True)
                passed += 1
            else:
                print_result(name, False)
                failed += 1
        except Exception as e:
            print_result(name, False, str(e))
            failed += 1

    print("\n" + "-" * 60)
    print(f"Results: {passed} passed, {failed} failed")
    print("=" * 60 + "\n")

    return failed == 0


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
