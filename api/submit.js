
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }

  try {
    const scriptUrl = process.env.APPS_SCRIPT_URL;

    if (!scriptUrl) {
      return res.status(500).json({
        success: false,
        message: "Apps Script URL is missing"
      });
    }

    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(req.body)
    });

    const result = await response.json();

    if (!response.ok || result.success !== true) {
      return res.status(502).json({
        success: false,
        message: result.message || "Submission failed"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Form submitted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Could not submit the form"
    });
  }
};
