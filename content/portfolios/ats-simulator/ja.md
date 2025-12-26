---
title: 地下鉄ATSシステムシミュレーション評価システム
slug: ats-simulator
cover: 1.jpg
technologies: [TypeScript, React, MQTT, Python, Java, SpringBoot]
---

## プロジェクト説明

地下鉄列車制御システムのシミュレーションソフトウェア。制御ロジックはPythonで開発され、フロントエンドはReact + TypeScriptを使用し、管理・分析プラットフォームはSpringBoot + Vueを使用しています。3つのサブシステムはMQTTメッセージキューを通じて通信し、制御コンソールなどの外部物理デバイスをサポートしています。線路、分岐器、信号機、プラットフォームなどのシミュレーション操作をサポートします。列車の作成、各種異常イベントの定義、マルチユーザーログイン、試験問題の編集と読み込み、コンソール操作を列車にバインドして列車を制御することができ、すべての操作は自動的に記録され、分析されてレポートが生成されます。

## スクリーンショット
![Screenshot 1](1.jpg)
![Screenshot 2](2.jpg)
![Screenshot 3](3.jpg)

