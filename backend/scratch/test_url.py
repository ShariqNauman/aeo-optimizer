import requests

def verify_url_verbose(url: str, timeout: int = 5):
    print(f"Testing URL: {url}")
    if not url or not url.startswith("http"):
        print("Invalid URL format.")
        return False
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        print("Attempting HEAD request...")
        resp = requests.head(url, timeout=timeout, allow_redirects=True, headers=headers)
        print(f"HEAD Status Code: {resp.status_code}")
        if resp.status_code >= 400:
            print("HEAD failed, attempting GET...")
            resp = requests.get(url, timeout=timeout, allow_redirects=True, headers=headers, stream=True)
            print(f"GET Status Code: {resp.status_code}")
            return resp.status_code < 400
        return True
    except Exception as e:
        print(f"HEAD Exception: {e}")
        try:
            print("Attempting GET request due to HEAD exception...")
            resp = requests.get(url, timeout=timeout, allow_redirects=True, headers=headers, stream=True)
            print(f"GET Status Code: {resp.status_code}")
            return resp.status_code < 400
        except Exception as e2:
            print(f"GET Exception: {e2}")
            return False

verify_url_verbose("https://summithotelusj.com/")
verify_url_verbose("http://summithotelusj.com/")
verify_url_verbose("https://www.summithotelusj.com/")
