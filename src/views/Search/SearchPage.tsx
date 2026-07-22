import { useState, useCallback, useRef } from 'react';
import {
  Typography,
  Input,
  Radio,
  List,
  Tag,
  Pagination,
  Empty,
  Spin,
  Card,
  Space,
  Button,
  Flex,
} from 'antd';
import {
  SearchOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../../hooks/useIntelligence';
import type { SearchResultType } from '../../types/intelligence';

const { Title, Text, Paragraph } = Typography;

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  notice: { label: '公告', color: 'blue' },
  approval: { label: '审批', color: 'orange' },
};

export default function SearchPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const keywordRef = useRef('');
  const [filterType, setFilterType] = useState<SearchResultType | 'all'>('all');
  const filterTypeRef = useRef<SearchResultType | 'all'>('all');
  const { results, total, loading, pageNum, pageSize, searched, setPageNum, search } = useSearch();

  const handleSearch = useCallback(() => {
    setPageNum(1);
    search(keywordRef.current, filterTypeRef.current);
  }, [search, setPageNum]);

  const handlePageChange = useCallback(
    (page: number, size: number) => {
      setPageNum(page);
      search(keywordRef.current, filterTypeRef.current);
    },
    [search, setPageNum],
  );

  const handleResultClick = (link: string) => {
    navigate(link);
  };

  return (
    <div>
      <Title level={3}>全文检索</Title>

      <Card>
        <Flex gap={8} style={{ marginBottom: 16 }}>
          <Input
            placeholder="输入关键词搜索公告、审批记录..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              keywordRef.current = e.target.value;
            }}
            onPressEnter={handleSearch}
            prefix={<SearchOutlined />}
            size="large"
            allowClear
            style={{ flex: 1 }}
          />
          <Button type="primary" size="large" onClick={handleSearch} loading={loading}>
            搜索
          </Button>
        </Flex>

        <Radio.Group
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value);
            filterTypeRef.current = e.target.value;
          }}
          style={{ marginBottom: 16 }}
        >
          <Radio.Button value="all">全部</Radio.Button>
          <Radio.Button value="notice">公告</Radio.Button>
          <Radio.Button value="approval">审批</Radio.Button>
        </Radio.Group>
      </Card>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Spin description="搜索中..." />
        </div>
      ) : searched && results.length === 0 ? (
        <Empty description="未找到相关结果" style={{ marginTop: 40 }} />
      ) : results.length > 0 ? (
        <>
          <Text type="secondary" style={{ display: 'block', margin: '16px 0 8px' }}>
            共找到 {total} 条结果
          </Text>
          <List
            dataSource={results}
            renderItem={(item) => {
              const config = TYPE_LABELS[item.type] || { label: item.type, color: 'default' };
              return (
                <List.Item style={{ cursor: 'pointer', padding: '16px 0' }} onClick={() => handleResultClick(item.link)}>
                  <List.Item.Meta
                    title={
                      <Space>
                        <FileTextOutlined />
                        <Text strong>{item.title}</Text>
                        <Tag color={config.color}>{config.label}</Tag>
                        {!item.canAccess && (
                          <Tag icon={<LockOutlined />} color="default">
                            无权限
                          </Tag>
                        )}
                      </Space>
                    }
                    description={
                      <div>
                        <div
                          style={{ marginBottom: 4, color: 'rgba(0, 0, 0, 0.65)' }}
                          dangerouslySetInnerHTML={{ __html: item.snippet }}
                        />
                        <Space size="middle">
                          <Text type="secondary">
                            <CheckCircleOutlined /> {item.source}
                          </Text>
                          <Text type="secondary">{item.publishTime}</Text>
                        </Space>
                      </div>
                    }
                  />
                </List.Item>
              );
            }}
          />
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Pagination
              current={pageNum}
              pageSize={pageSize}
              total={total}
              showSizeChanger
              showTotal={(t) => `共 ${t} 条`}
              onChange={handlePageChange}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
