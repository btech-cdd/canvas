(async function() {
  const BTECH_HS_LIST = [
    ''
  ]
  // Get the full URL of the current page
  const fullUrl = window.location.href;
  const url = new URL(fullUrl);
  // Define the regex pattern to match 'accounts/<account_id>'
  const regex = /accounts\/(\d+)/;
  // Execute the regex on the URL
  const match = fullUrl.match(regex);
  // Extract the account_id if the regex matched
  const accountId = match ? match[1] : null;
  // Extract the enrollment_term_id from the search parameters
  const enrollmentTermId = url.searchParams.get('enrollment_term_id'); // "1110"

  let courses = await canvasGet(`/api/v1/courses?account_id=${accountId}&enrollment_term_id=${enrollmentTermId}`);
  console.log(courses);

})();