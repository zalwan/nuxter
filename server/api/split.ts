export default defineEventHandler(async (event) => {
  try {
    const formItems = await readMultipartFormData(event);
    if (!formItems) {
      throw createError({ statusCode: 400, statusMessage: "Invalid FormData" });
    }

    const formData = new FormData();

    for (const item of formItems) {
      if (!item.name) continue;

      if (item.filename) {
        const blob = new Blob([item.data], { type: "application/pdf" });
        formData.append(item.name, blob, item.filename);
      } else {
        formData.append(item.name, item.data.toString());
      }
    }

    const response = await fetch("https://pdf-splitter.koyeb.app/split", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: "Failed to split PDF",
      });
    }

    const blob = await response.blob();
    return new Response(blob, {
      headers: { "Content-Type": "application/pdf" },
    });
  } catch (error) {
    let errorMessage = "Unknown error occurred";

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return { error: errorMessage };
  }
});
