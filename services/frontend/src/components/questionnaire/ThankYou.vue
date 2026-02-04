<template>
  <div class="thank-you-container">
    <div class="content">
      <h2>{{ $t("thanks.title") }}</h2>
      <p>
        {{ $t("thanks.subtitle") }}
      </p>
    </div>
  </div>
</template>
<style scoped>
.thank-you-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
}

.content {
  max-width: 480px;
}

h2 {
  margin-bottom: 12px;
}

p {
  color: #555;
}
</style>