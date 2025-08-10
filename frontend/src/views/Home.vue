<template>
  <div class="home-page">
    <!-- 导航栏 -->
    <NavHeader />
    
    <!-- 主要内容 -->
    <main class="main-content">
      <div class="container">
        <!-- 轮播图区域 -->
        <section class="hero-section">
          <el-carousel height="300px" interval="5000" indicator-position="outside">
            <el-carousel-item v-for="item in 3" :key="item">
              <div class="carousel-item" :style="{ backgroundImage: `url(/banner-${item}.jpg)` }">
                <div class="carousel-content">
                  <h2>欢迎来到发卡网系统</h2>
                  <p>专业的虚拟商品发卡平台，支持多种商品类型，自动发货</p>
                </div>
              </div>
            </el-carousel-item>
          </el-carousel>
        </section>

        <!-- 分类导航 -->
        <section class="category-section">
          <h3 class="section-title">商品分类</h3>
          <div class="category-grid">
            <div 
              v-for="category in categories" 
              :key="category.id"
              class="category-item"
              @click="goToCategory(category.id)"
            >
              <div class="category-icon">
                <el-icon size="32"><Box /></el-icon>
              </div>
              <div class="category-info">
                <h4>{{ category.name }}</h4>
                <p>{{ category.goods_count }} 个商品</p>
              </div>
            </div>
          </div>
        </section>

        <!-- 热门商品 -->
        <section class="goods-section">
          <div class="section-header">
            <h3 class="section-title">热门商品</h3>
            <router-link to="/goods" class="view-more">查看更多</router-link>
          </div>
          <div class="goods-grid">
            <GoodCard 
              v-for="good in hotGoods" 
              :key="good.id" 
              :good="good"
            />
          </div>
        </section>

        <!-- 推荐商品 -->
        <section class="goods-section">
          <div class="section-header">
            <h3 class="section-title">推荐商品</h3>
            <router-link to="/goods" class="view-more">查看更多</router-link>
          </div>
          <div class="goods-grid">
            <GoodCard 
              v-for="good in recommendGoods" 
              :key="good.id" 
              :good="good"
            />
          </div>
        </section>
      </div>
    </main>

    <!-- 页脚 -->
    <AppFooter />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { categories, goods } from '@/api'
import NavHeader from '@/components/NavHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import GoodCard from '@/components/GoodCard.vue'
import { Box } from '@element-plus/icons-vue'

const router = useRouter()

const categories = ref([])
const hotGoods = ref([])
const recommendGoods = ref([])

const loadCategories = async () => {
  try {
    const response = await categories.list()
    categories.value = response.data
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

const loadHotGoods = async () => {
  try {
    const response = await goods.hot({ limit: 8 })
    hotGoods.value = response.data
  } catch (error) {
    console.error('加载热门商品失败:', error)
  }
}

const loadRecommendGoods = async () => {
  try {
    const response = await goods.recommend({ limit: 8 })
    recommendGoods.value = response.data
  } catch (error) {
    console.error('加载推荐商品失败:', error)
  }
}

const goToCategory = (categoryId) => {
  router.push(`/category/${categoryId}`)
}

onMounted(() => {
  loadCategories()
  loadHotGoods()
  loadRecommendGoods()
})
</script>

<style lang="scss" scoped>
.home-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 0;
}

.hero-section {
  margin-bottom: 40px;
  
  .carousel-item {
    height: 300px;
    background-size: cover;
    background-position: center;
    background-color: var(--el-color-primary-light-8);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.3);
    }
  }
  
  .carousel-content {
    text-align: center;
    color: white;
    z-index: 1;
    position: relative;
    
    h2 {
      font-size: 32px;
      margin-bottom: 16px;
      font-weight: 600;
    }
    
    p {
      font-size: 18px;
      opacity: 0.9;
    }
  }
}

.category-section {
  margin-bottom: 40px;
  
  .category-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-top: 20px;
  }
  
  .category-item {
    display: flex;
    align-items: center;
    padding: 20px;
    background: var(--el-bg-color);
    border-radius: 8px;
    box-shadow: var(--el-box-shadow-light);
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--el-box-shadow);
    }
    
    .category-icon {
      color: var(--el-color-primary);
      margin-right: 16px;
    }
    
    .category-info {
      h4 {
        margin: 0 0 4px 0;
        font-size: 16px;
        color: var(--el-text-color-primary);
      }
      
      p {
        margin: 0;
        color: var(--el-text-color-secondary);
        font-size: 14px;
      }
    }
  }
}

.goods-section {
  margin-bottom: 40px;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    .view-more {
      color: var(--el-color-primary);
      font-size: 14px;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
  
  .goods-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
  }
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}

@media (max-width: 768px) {
  .hero-section {
    .carousel-content {
      padding: 0 20px;
      
      h2 {
        font-size: 24px;
      }
      
      p {
        font-size: 16px;
      }
    }
  }
  
  .category-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .goods-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
  }
  
  .section-title {
    font-size: 20px;
  }
}
</style>