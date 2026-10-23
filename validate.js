const form = document.getElementById("contactForm");
const form = document.getElementById("contactForm");

form.addEventListener("submit", function (event) {
  const heard = document.querySelector('input[name="how-heard"]:checked');
  const firstName = document.getElementById("firstname").value.trim();
  const lastName = document.getElementById("lastname").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();

  if (!heard) {
    event.preventDefault();
    alert("Please tell us how you heard about us.");
    return;
  }

  if (firstName === "") {
    event.preventDefault();
    alert("First name is required.");
    document.getElementById("firstname").focus();
    return;
  }

  if (/[0-9]/.test(firstName)) {
    event.preventDefault();
    alert("First name cannot include numbers.");
    document.getElementById("firstname").focus();
    return;
  }

  if (lastName === "") {
    event.preventDefault();
    alert("Last name is required.");
    document.getElementById("lastname").focus();
    return;
  }

  if (/[0-9]/.test(lastName)) {
    event.preventDefault();
    alert("Last name cannot include numbers.");
    document.getElementById("lastname").focus();
    return;
  }

  if (email === "") {
    event.preventDefault();
    alert("Email is required.");
    document.getElementById("email").focus();
    return;
  }

  if (!email.includes("@") || !email.includes(".")) {
    event.preventDefault();
    alert("Please enter a valid email address.");
    document.getElementById("email").focus();
    return;
  }

  if (message !== "") {
    const words = message.split(/\s+/).filter(Boolean).length;
    if (words > 300) {
      event.preventDefault();
      alert("Your message must be 300 words or fewer.");
      document.getElementById("message").focus();
      return;
    }
  }

  
});
