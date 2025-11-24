"""
Test Suite for Profile API Endpoints
Tests the /api/profile endpoints and related functionality
"""

import requests
import json
import os
from datetime import datetime

# Base URL from environment
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'http://localhost:3000')
API_BASE = f"{BASE_URL}/api"

class Colors:
    """Terminal colors for better output readability"""
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_section(title):
    """Print a formatted section header"""
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*80}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{title.center(80)}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*80}{Colors.ENDC}\n")

def print_test(test_name):
    """Print test name"""
    print(f"{Colors.OKCYAN}🧪 Test: {test_name}{Colors.ENDC}")

def print_success(message):
    """Print success message"""
    print(f"{Colors.OKGREEN}✅ {message}{Colors.ENDC}")

def print_error(message):
    """Print error message"""
    print(f"{Colors.FAIL}❌ {message}{Colors.ENDC}")

def print_warning(message):
    """Print warning message"""
    print(f"{Colors.WARNING}⚠️  {message}{Colors.ENDC}")

def print_info(message):
    """Print info message"""
    print(f"{Colors.OKBLUE}ℹ️  {message}{Colors.ENDC}")

def print_response(response):
    """Print formatted response details"""
    print(f"{Colors.OKBLUE}📥 Response Status: {response.status_code}{Colors.ENDC}")
    try:
        data = response.json()
        print(f"{Colors.OKBLUE}📦 Response Data:{Colors.ENDC}")
        print(json.dumps(data, indent=2))
    except:
        print(f"{Colors.WARNING}Response body: {response.text[:200]}...{Colors.ENDC}")

def get_test_credentials():
    """
    Get test credentials from user
    Returns: dict with email and password
    """
    print_section("TEST SETUP - Enter Test User Credentials")
    print_info("Please provide credentials for a test user account")
    print_info("This should be an existing user with a complete profile")
    
    email = input(f"{Colors.OKCYAN}Enter email: {Colors.ENDC}").strip()
    password = input(f"{Colors.OKCYAN}Enter password: {Colors.ENDC}").strip()
    
    return {"email": email, "password": password}

def authenticate_user(email, password):
    """
    Authenticate user and get access token
    Returns: (access_token, user_id) or (None, None) if failed
    """
    print_test("Authenticating User")
    
    try:
        # Try to get Supabase credentials from environment
        supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
        supabase_anon_key = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
        
        if not supabase_url or not supabase_anon_key:
            print_error("Supabase credentials not found in environment")
            print_info("Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set")
            return None, None
        
        # Authenticate with Supabase
        auth_url = f"{supabase_url}/auth/v1/token?grant_type=password"
        headers = {
            'apikey': supabase_anon_key,
            'Content-Type': 'application/json'
        }
        data = {
            'email': email,
            'password': password
        }
        
        response = requests.post(auth_url, headers=headers, json=data)
        
        if response.status_code == 200:
            auth_data = response.json()
            access_token = auth_data.get('access_token')
            user_id = auth_data.get('user', {}).get('id')
            
            print_success(f"Authentication successful!")
            print_info(f"User ID: {user_id}")
            return access_token, user_id
        else:
            print_error(f"Authentication failed: {response.status_code}")
            print_response(response)
            return None, None
            
    except Exception as e:
        print_error(f"Authentication error: {str(e)}")
        return None, None

def test_profile_get(access_token):
    """Test GET /api/profile endpoint"""
    print_test("GET /api/profile - Fetch user profile")
    
    try:
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        response = requests.get(f"{API_BASE}/profile", headers=headers)
        print_response(response)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                profile = data.get('data', {})
                print_success("Profile fetched successfully!")
                
                # Validate profile structure
                required_fields = ['user_id', 'legal_first_name', 'legal_surname']
                missing_fields = [f for f in required_fields if not profile.get(f)]
                
                if missing_fields:
                    print_warning(f"Missing required fields: {', '.join(missing_fields)}")
                else:
                    print_success("All required fields present")
                
                # Display key profile info
                print_info(f"Name: {profile.get('legal_first_name', 'N/A')} {profile.get('legal_surname', 'N/A')}")
                if profile.get('alias_first_name'):
                    print_info(f"Alias: {profile.get('alias_first_name', '')} {profile.get('alias_surname', '')}")
                print_info(f"Location: {profile.get('city', 'N/A')}, {profile.get('country', 'N/A')}")
                print_info(f"Bio: {profile.get('bio', 'No bio')[:100]}...")
                
                return True, profile
            else:
                print_error(f"API returned success=false: {data.get('error', 'Unknown error')}")
                return False, None
        elif response.status_code == 404:
            print_error("Profile not found (404)")
            print_warning("This user may not have completed profile setup")
            return False, None
        elif response.status_code == 401:
            print_error("Unauthorized (401) - Invalid or expired token")
            return False, None
        else:
            print_error(f"Unexpected status code: {response.status_code}")
            return False, None
            
    except Exception as e:
        print_error(f"Error testing profile GET: {str(e)}")
        return False, None

def test_profile_update(access_token, profile):
    """Test PATCH /api/profile endpoint"""
    print_test("PATCH /api/profile - Update profile bio")
    
    try:
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        # Update bio with timestamp to verify update worked
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        test_bio = f"Test bio updated at {timestamp}"
        
        data = {
            'bio': test_bio
        }
        
        response = requests.patch(f"{API_BASE}/profile", headers=headers, json=data)
        print_response(response)
        
        if response.status_code == 200:
            resp_data = response.json()
            if resp_data.get('success'):
                updated_profile = resp_data.get('data', {})
                
                if updated_profile.get('bio') == test_bio:
                    print_success("Profile bio updated successfully!")
                    print_info(f"New bio: {test_bio}")
                    
                    # Restore original bio
                    if profile and profile.get('bio'):
                        restore_data = {'bio': profile.get('bio')}
                        restore_response = requests.patch(
                            f"{API_BASE}/profile", 
                            headers=headers, 
                            json=restore_data
                        )
                        if restore_response.status_code == 200:
                            print_success("Original bio restored")
                        else:
                            print_warning("Failed to restore original bio")
                    
                    return True
                else:
                    print_error("Bio was not updated correctly")
                    return False
            else:
                print_error(f"Update failed: {resp_data.get('error', 'Unknown error')}")
                return False
        else:
            print_error(f"Update failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Error testing profile update: {str(e)}")
        return False

def test_skills_get(access_token):
    """Test GET /api/skills endpoint"""
    print_test("GET /api/skills - Fetch user skills")
    
    try:
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        response = requests.get(f"{API_BASE}/skills", headers=headers)
        print_response(response)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                skills = data.get('data', [])
                print_success(f"Skills fetched successfully! Found {len(skills)} skills")
                
                if skills:
                    print_info("Skills:")
                    for skill in skills:
                        print_info(f"  - {skill.get('skill_name', 'N/A')} (ID: {skill.get('id', 'N/A')})")
                else:
                    print_warning("No skills found for this user")
                
                return True, skills
            else:
                print_error(f"API returned success=false: {data.get('error', 'Unknown error')}")
                return False, []
        else:
            print_error(f"Failed with status {response.status_code}")
            return False, []
            
    except Exception as e:
        print_error(f"Error testing skills GET: {str(e)}")
        return False, []

def test_profile_check_complete(access_token):
    """Test GET /api/profile/check-complete endpoint"""
    print_test("GET /api/profile/check-complete - Check profile completeness")
    
    try:
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        response = requests.get(f"{API_BASE}/profile/check-complete", headers=headers)
        print_response(response)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                is_complete = data.get('data', {}).get('is_complete', False)
                
                if is_complete:
                    print_success("Profile is complete!")
                else:
                    print_warning("Profile is incomplete")
                    print_info("Users need: legal_first_name, legal_surname, phone, profile_photo_url")
                
                return True, is_complete
            else:
                print_error(f"Check failed: {data.get('error', 'Unknown error')}")
                return False, False
        else:
            print_error(f"Failed with status {response.status_code}")
            return False, False
            
    except Exception as e:
        print_error(f"Error checking profile completeness: {str(e)}")
        return False, False

def test_route_exists():
    """Test if the /api/profile route responds (even without auth)"""
    print_test("Testing /api/profile route existence")
    
    try:
        # Try without auth - should get 401, not 404
        response = requests.get(f"{API_BASE}/profile")
        
        if response.status_code == 401:
            print_success("Route exists! (Got expected 401 Unauthorized)")
            return True
        elif response.status_code == 404:
            print_error("Route not found! (404)")
            print_warning("This indicates a routing configuration issue")
            return False
        elif response.status_code == 200:
            print_warning("Got 200 without auth - unexpected but route exists")
            return True
        else:
            print_warning(f"Got status {response.status_code} - route may exist with issues")
            return True
            
    except Exception as e:
        print_error(f"Error testing route: {str(e)}")
        return False

def run_all_tests():
    """Run all profile-related tests"""
    print_section("PROFILE API TEST SUITE")
    print_info(f"Testing against: {API_BASE}")
    print_info(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    results = {
        'total': 0,
        'passed': 0,
        'failed': 0
    }
    
    # Test 1: Route existence
    print_section("TEST 1: Route Existence Check")
    results['total'] += 1
    if test_route_exists():
        results['passed'] += 1
    else:
        results['failed'] += 1
        print_warning("Continuing with authentication tests...")
    
    # Get credentials and authenticate
    credentials = get_test_credentials()
    access_token, user_id = authenticate_user(credentials['email'], credentials['password'])
    
    if not access_token:
        print_error("Cannot continue tests without valid authentication")
        print_section("TEST SUMMARY")
        print_info(f"Total Tests: {results['total']}")
        print_success(f"Passed: {results['passed']}")
        print_error(f"Failed: {results['failed']}")
        return
    
    # Test 2: Get profile
    print_section("TEST 2: Get User Profile")
    results['total'] += 1
    success, profile = test_profile_get(access_token)
    if success:
        results['passed'] += 1
    else:
        results['failed'] += 1
    
    # Test 3: Check profile completeness
    print_section("TEST 3: Check Profile Completeness")
    results['total'] += 1
    success, is_complete = test_profile_check_complete(access_token)
    if success:
        results['passed'] += 1
    else:
        results['failed'] += 1
    
    # Test 4: Update profile
    if profile:
        print_section("TEST 4: Update Profile")
        results['total'] += 1
        if test_profile_update(access_token, profile):
            results['passed'] += 1
        else:
            results['failed'] += 1
    else:
        print_warning("Skipping profile update test - no profile data available")
    
    # Test 5: Get skills
    print_section("TEST 5: Get User Skills")
    results['total'] += 1
    success, skills = test_skills_get(access_token)
    if success:
        results['passed'] += 1
    else:
        results['failed'] += 1
    
    # Print summary
    print_section("TEST SUMMARY")
    print_info(f"Total Tests: {results['total']}")
    print_success(f"Passed: {results['passed']}")
    if results['failed'] > 0:
        print_error(f"Failed: {results['failed']}")
    else:
        print_success(f"Failed: {results['failed']}")
    
    pass_rate = (results['passed'] / results['total'] * 100) if results['total'] > 0 else 0
    print_info(f"Pass Rate: {pass_rate:.1f}%")
    
    if results['failed'] > 0:
        print_warning("\n⚠️  Some tests failed. Check the output above for details.")
        print_info("Common issues:")
        print_info("  1. Profile not found (404) - User hasn't completed profile setup")
        print_info("  2. Unauthorized (401) - Token expired or invalid")
        print_info("  3. Route not found (404) - API routing configuration issue")
    else:
        print_success("\n🎉 All tests passed!")

if __name__ == "__main__":
    try:
        run_all_tests()
    except KeyboardInterrupt:
        print_warning("\n\nTests interrupted by user")
    except Exception as e:
        print_error(f"\n\nUnexpected error: {str(e)}")
        import traceback
        traceback.print_exc()
